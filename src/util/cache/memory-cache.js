import Crypto from "crypto";

export class InMemoryCache {

  constructor(cache = {}, secret = "InMemoryCache") {
    // XXX this is really only used for testing purposes
    this.cache = cache;
    this.secret = secret;
  }

  get(id, lookup, { ttl, cache } = { ttl: 86400, cache: true }) {
    let fromCache = false;
    return new Promise((done) => {
      const data = this.cache[id];
      if ((!data || !cache) && lookup) return lookup().then(done);

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

  set(id, data, ttl = 86400) {
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

  del(id) {
    delete this.cache[id];
  }

  encode(obj, prefix = "") {
    const cipher = Crypto.createHmac("sha256", this.secret);
    const str = `${prefix}${JSON.stringify(obj)}`;
    return cipher.update(str).digest("hex");
  }

}
