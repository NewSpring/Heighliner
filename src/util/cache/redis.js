import Crypto from "crypto";

// XXX replace with https://github.com/h0x91b/redis-fast-driver
import Redis from "redis";
import DataLoader from "dataloader";

import { parseGlobalId } from "./../node/model";

let db;
let dd;
export function connect(monitor) {
  dd = monitor && monitor.datadog;
  if (db) return Promise.resolve(true);
  let hasReturned = false;
  return new Promise((cb) => {
    db = Redis.createClient(6379, process.env.REDIS_HOST);

    db.on("connect", () => {
      hasReturned = true;
      cb(true);
    });

    db.on("error", error => {
      if (!hasReturned) {
        hasReturned = true;
        cb(false);
      }

      console.error("REDIS error:", error); // tslint:disable-line
    });
  });
}

export class RedisCache {
  count = 0;

  constructor(secret = "RedisCache") {
    this.secret = secret;

    // XXX we should move data loader to being a per request batching system
    // until then, we disabled the cache
    this.idLoader = new DataLoader(keys => new Promise((resolve, reject) => {
      db.mget(keys, (error, results) => {
        if (error) return reject(error);
        return resolve(results.map((result, index) =>
          result !== null ? result : new Error(`No key: ${keys[index]}`),
        ));
      });
    }), { cache: false });
  }

  getCount() {
    this.count++; // eslint-disable-line
    return this.count;
  }

  time(promise, log) {
    const prefix = "RedisCache";
    const count = this.getCount();
    const start = new Date();
    const label = `${prefix}-${count}`;
    if (dd) dd.increment(`${prefix}.transaction.count`);
    console.time(label); // tslint:disable-line
    return promise
      .then((x) => {
        if (log()) {
          const end = new Date();
          if (dd) dd.histogram(`${prefix}.transaction.time`, end - start, [""]);
          console.timeEnd(label); // tslint:disable-line
        } else if (dd) dd.increment(`${prefix}.transaction.miss`);
        return x;
      })
      .catch((x) => {
        const end = new Date();
        if (dd) dd.histogram(`${prefix}.transaction.time`, end - start, [""]);
        if (dd) dd.increment(`${prefix}.transaction.error`);
        console.timeEnd(label); // tslint:disable-line
        return x;
      });
  }

  get(id, lookup, { ttl, cache } = { cache: true, ttl: 18000 }) {
    let fromCache = false;
    const log = () => fromCache;
    return this.time(new Promise((done) => {
      if (!cache && lookup) return lookup().then(done);
      try {
        // try to nest information based on global id
        const { __type } = parseGlobalId(id);
        id = `${__type}:${id}`; // eslint-disable-line
      } catch (e) { /* tslint:disable-line */ }

      return this.idLoader.load(id)
        .then((data) => {

          if (!data) return lookup().then(done);
          // eslint-disable-next-line
          try { data = JSON.parse(data); } catch (e) {
            return lookup().then(done);
          }

          fromCache = true;
          return done(data);

        })
        .catch(() => lookup().then(done));
    }).then((data) => {
      if (data && !fromCache) process.nextTick(() => { this.set(id, data, ttl); });
      return data;
    }), log);
  }

  set(id, data, ttl = 86400) {
    return new Promise(done => {
      // XXX this should technically never fail
      try {
        // save to cache
        db.set(id, JSON.stringify(data));

        // save to dataloader
        this.idLoader.prime(id, JSON.stringify(data));

        // clear cache
        db.expire(id, ttl);

        return done(true);
      } catch (e) {
        return done(false);
      }
    });
  }

  del(id) {
    // try to nest information based on global id
    try {
      const { __type } = parseGlobalId(id);
      id = `${__type}:${id}`; // eslint-disable-line
    } catch (e) {
      return;
    }
    db.del(id); // clear redis
    this.idLoader.clear(id); // clear dataloader
  }

  encode(obj, type, user) {
    const cipher = Crypto.createHmac("sha256", this.secret);
    type = type ? `${type  }:` : ""; // eslint-disable-line
    user = user ? `${user  }:` : ""; // eslint-disable-line
    const str = cipher.update(JSON.stringify(obj), "utf-8").digest("hex");

    return `query:${type}${user}${str}`;
  }

  clearAll() {
    db.flushdb();
  }
}
