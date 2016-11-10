import { Cache } from "./cache";
import Crypto from "crypto";

export class InMemoryCache extends Cache {
  private cache;
  private secret: string;

  constructor(cache = {}, secret = "InMemoryCache") {
    super(cache, secret);

    // XXX this is really only used for testing purposes
    this.cache = cache;
    this.secret = secret;
  }

  public get(
    id: string,
    lookup: () => Promise<Object | void>,
    { ttl, cache }: { ttl?: number, cache?: boolean } = { ttl: 86400, cache: true }
  ): Promise<Object | void> {
    let fromCache = false;
    return new Promise((done) => {
      let data = this.cache[id];

      if ((!data || !cache) && lookup) {
        return lookup().then(done);
      }

      fromCache = true;
      return done(data);

    }).then((data) => {

      if (data && !fromCache) {
        // async the save
        process.nextTick(() => {
          this.set(id, data, ttl);
        });
      }

      return data;
    });
  }

  public set(id, data, ttl = 86400): Promise<boolean> {
    return new Promise((done) => {
      // XXX this should technically never fail
      try {
        // save to cache
        this.cache[id] = data;

        // clear cache
        setTimeout(() => {
          delete this.cache[id];
        }, ttl * 60);

        return done(true);
      } catch (e) {
        return done(false);
      }
    });
  }

  public del(id: string): void {
    delete this.cache[id];
  }

  public encode(obj: Object, prefix: string = ""): string {
    const cipher = Crypto.createHmac("sha256", this.secret);
    const str = `${prefix}${JSON.stringify(obj)}`;
    return cipher.update(str).digest("hex");
  }

}