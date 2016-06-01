
import { expect } from "chai";
import casual from "casual";
import { InMemoryCache } from "../../../lib/util/cache/memory-cache";

describe("InMemoryCache", () => {

  // mutable object for testing purposes
  let cacheData;
  let cache;

  describe("get", () => {

    afterEach(() => {
      cacheData = undefined;
      cache = undefined;
    });

    it("should have a way to get items from the cache", (done) => {
      const id = casual.word;
      const data = { test: casual.word };

      cacheData = { [id]: data };
      cache = new InMemoryCache(cacheData);

      cache.get(id)
        .then((result) => {
          expect(result).to.deep.equal(data);
          done();
        });
    });

    it("should use a lookup method if no cache entry exists", (done) => {
      const id = casual.word;
      const data = { test: casual.word };

      cacheData = {};
      cache = new InMemoryCache(cacheData);

      const spyLookup = () => {
        return Promise.resolve(data);
      }

      cache.get(id, spyLookup)
        .then((result) => {
          expect(result).to.deep.equal(data);
          done();
        });
    });

    it("should have a way to set items in the cache with a ttl", (done) => {
      const id = casual.word;
      const data = { test: casual.word };

      cacheData = {};
      cache = new InMemoryCache(cacheData);

      const spyLookup = () => {
        return Promise.resolve(data);
      }

      cache.get(id, spyLookup, .1)
        .then((result) => {
          expect(result).to.deep.equal(data);
        });

      setTimeout(() => {
        expect(cacheData[id]).to.not.exist;
        done();
      }, (.1 * 60) + 25);

    });

  });

  describe("set", () => {

    beforeEach(() => {
      cacheData = {};
      cache = new InMemoryCache(cacheData);
    });

    afterEach(() => {
      cacheData = undefined;
      cache = undefined;
    });

    it("should have a way to set items in the cache", (done) => {
      const id = casual.word;
      const data = { test: casual.word };

      cache.set(id, data)
        .then(() => {
          expect(cacheData[id]).to.deep.equal(data);
          done();
        });
    });

    it("should eventually return true if successfully set", (done) => {
      const id = casual.word;
      const data = { test: casual.word };

      cache.set(id, data)
        .then((success) => {
          expect(cacheData[id]).to.deep.equal(data);
          expect(success).to.be.true;
          done();
        });
    });

    // it("should eventually return true if successfully set", (done) => {
    //   const id = casual.word;
    //   const data = { test: casual.word };

    //   // destroy the `connection` to the memory store
    //   cacheData = false;

    //   cache.set(id, data)
    //     .then((success) => {
    //       console.log(success)
    //       // expect(success).to.be.false;
    //       done();
    //     });
    // });

    it("should have a way to set items in the cache with a ttl", (done) => {
      const id = casual.word;
      const data = { test: casual.word };

      cache.set(id, data, .1)
        .then(() => {
          expect(cacheData[id]).to.deep.equal(data);
        });

      setTimeout(() => {
        expect(cacheData[id]).to.not.exist;
        done();
      }, (.1 * 60) + 25);

    });

  });

  describe("del", () => {

    it("should allow removing existing cache entries", () => {
      const id = casual.word;
      const data = { test: casual.word };

      cacheData = { [id]: data };
      cache = new InMemoryCache(cacheData);

      cache.del(id);
      expect(cacheData[id]).to.not.exist;
    });

  });


});
