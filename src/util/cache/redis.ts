import { Cache } from "./cache";
import * as Crypto from "crypto";

import Redis from "redis";
import DataLoader from "dataloader";

let db;
export function connect(address: string, port: number = 6379): Promise<boolean> {
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

    this.idLoader = new DataLoader(keys => new Promise((resolve, reject) => {
      db.mget(keys, (error, results) => {
        if (error) return reject(error);
        resolve(results.map((result, index) =>
          result !== null ? result : new Error(`No key: ${keys[index]}`)
        ));
      });
    }));
  }

  private getCount() {
    this.count++;
    return this.count;
  }

  public get(
    id: string,
    lookup: () => Promise<any>,
    { ttl, cache }: { ttl: number, cache: boolean } = { cache: true, ttl: 86400 }
  ): Promise<Object | void> {
    let fromCache = false;
    const label = `RedisCache-${this.getCount()}`;
    console.time(label); // tslint:disable-line
    return new Promise((done) => {
      if (!cache && lookup) {
        return lookup().then(done);
      }

      return this.idLoader.load(id)
        .then(data => {
          if (!data) return lookup().then(done);

          try {
            data = JSON.parse(data);
          } catch (e) {
            return lookup().then(done);
          }

          fromCache = true;
          done(data);
        })
        .catch(x => lookup().then(done));
    }).then((data) => {

      if (data && !fromCache) {
        // async the save
        process.nextTick(() => {
          this.set(id, data, ttl);
        });
      }
      if (fromCache) console.timeEnd(label); // tslint:disable-line
      return data;
    });
  }

  public set(id: string, data: Object, ttl: number = 86400): Promise<Boolean> {
    return new Promise((done) => {
      // XXX this should technically never fail
      try {
        // save to cache
        db.set(id, JSON.stringify(data));

        // clear cache
        db.expire(id, ttl);

        return done(true);
      } catch (e) {
        return done(false);
      }
    });
  }

  public del(id: string): void {
    db.del(id);
  }

  public encode(obj: Object, prefix: string = ""): string {
    const cipher = Crypto.createHmac("sha256", this.secret);
    const str = `${prefix}${JSON.stringify(obj)}`;
    return cipher.update(str).digest("hex");
  }

}
