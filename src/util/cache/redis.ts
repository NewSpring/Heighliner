import { Cache } from "./cache";
import Crypto from "crypto";

// XXX replace with https://github.com/h0x91b/redis-fast-driver
import Redis from "redis";
import DataLoader from "dataloader";

import { parseGlobalId } from "./../node/model";

let db;
let dd;
export function connect(address: string, port: number = 6379, monitor: any): Promise<boolean> {
  dd = monitor && monitor.datadog;
  let hasReturned = false;
  return new Promise((cb) => {

    db = Redis.createClient(port, address);

    db.on("connect", () => {
      hasReturned = true;
      cb(true);
    });

    db.on("error", (error) => {
      if (!hasReturned) {
        hasReturned = true;
        cb(false);
      }

      console.error("REDIS error:", error); // tslint:disable-line
    });
  });
}

export class RedisCache implements Cache {
  private count: number = 0;
  private secret: string;
  private idLoader: any;

  constructor(secret: string = "RedisCache") {
    this.secret = secret;

    // XXX we should move data loader to being a per request batching system
    // until then, we disabled the cache
    this.idLoader = new DataLoader(keys => new Promise((resolve, reject) => {
      db.mget(keys, (error, results) => {
        if (error) return reject(error);
        resolve(results.map((result, index) =>
          result !== null ? result : new Error(`No key: ${keys[index]}`)
        ));
      });
    }), { cache: false });
  }

  private getCount() {
    this.count++;
    return this.count;
  }

  private time(promise: Promise<any>, log?: () => boolean): Promise<any> {
    const prefix = "RedisCache";
    const count = this.getCount();
    const start = new Date() as any;
    const label = `${prefix}-${count}`;
    if (dd) dd.increment(`${prefix}.transaction.count`);
    console.time(label); // tslint:disable-line
    return promise
      .then(x => {
        if (log()) {
          const end = new Date() as any;
          if (dd) dd.histogram(`${prefix}.transaction.time`, (end - start), [""]);
          console.timeEnd(label); // tslint:disable-line
        }
        return x;
      })
      .catch(x => {
        const end = new Date() as any;
        if (dd) dd.histogram(`${prefix}.transaction.time`, (end - start), [""]);
        if (dd) dd.increment(`${prefix}.transaction.error`);
        console.timeEnd(label); // tslint:disable-line
        return x;
      });
  }

  public get(
    id: string,
    lookup: () => Promise<any>,
    { ttl, cache }: { ttl: number, cache: boolean } = { cache: true, ttl: 86400 }
  ): Promise<Object | void> {
    let fromCache = false;
    const log = () => fromCache;
    return this.time(new Promise((done) => {
      if (!cache && lookup) return lookup().then(done);
      try {
        // try to nest information based on global id
        let { __type } = parseGlobalId(id);
        id = `${__type}:${id}`;
      } catch (e) { /* tslint:disable-line */ };

      return this.idLoader.load(id)
        .then(data => {
          if (!data) return lookup().then(done);

          try { data = JSON.parse(data); } catch (e) {
            return lookup().then(done);
          }

          fromCache = true;
          done(data);
        })
        .catch(x => lookup().then(done));
    }).then((data) => {
      if (data && !fromCache) process.nextTick(() => { this.set(id, data, ttl); });
      return data;
    }), log);
  }

  public set(id: string, data: Object, ttl: number = 86400): Promise<Boolean> {
    return new Promise((done) => {
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

  public del(id: string): void {
    // try to nest information based on global id
    let { __type } = parseGlobalId(id);
    id = `${__type}:${id}`;
    db.del(id); // clear redis
    this.idLoader.clear(id); // clear dataloader
  }

  public encode(obj: Object, type?: string, user?: string): string {
    const cipher = Crypto.createHmac("sha256", this.secret);
    type = type ? type + ":" : "";
    user = user ? user + ":" : "";
    const str = cipher.update(JSON.stringify(obj)).digest("hex");

    return `query:${type}${user}${str}`;
  }

  public clearAll() {
    db.flushdb();
  }

}
