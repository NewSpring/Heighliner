
import { expect } from "chai";
import casual from "casual";
import { defaultCache, resolvers } from "../../../lib/util/cache";
import { InMemoryCache } from "../../../lib/util/cache/memory-cache";

describe("Caching system", () => {

  describe("resolvers", () => {

    describe("cache", () => {

      it("should delete the id from the cache", (done) => {
        const id = casual.word,
              data = { test: casual.word },
              cacheData = { [id]: data },
              cache = new InMemoryCache(cacheData);

        const { Mutation } = resolvers;

        function get(id) {
          return Promise.resolve({ [id]: { test: casual.word }});
        }

        Mutation.cache(null, { id }, { cache, models: { Node: { get } } })
          .then((result) => {
            expect(cacheData[id]).to.not.exist;
            done();
          });
      });

      it("should refetch and save the data in the cache", (done) => {
        const id = casual.word,
              data = { test: casual.word },
              data2 = { test: casual.word },
              cacheData = { [id]: data },
              cache = new InMemoryCache(cacheData);

        const { Mutation } = resolvers;

        function get(id) {
          return cache.get(id, () => (Promise.resolve(data2)));
        }

        Mutation.cache(null, { id }, { cache, models: { Node: { get } } })
          .then((result) => {
            expect(result).to.deep.equal(data2);

            // cache resetting is an async action
            process.nextTick(() => {
              expect(cacheData[id]).to.deep.equal(data2);
              done();
            });

          });
      });

    });
  });

  describe("defaultCache", () => {

    describe("get", () => {
      it("should simply run the lookup method", (done) => {
        const lookup = () => {
          expect(true).to.be.true;
          done();
        }
        defaultCache.get(null, lookup);
      });
    });

    describe("set", () => {
      it("should return true and do nothing", (done) => {
        defaultCache.set()
          .then((success) => {
            expect(success).to.be.true;
            done();
          });
      });
    });

    describe("del", () => {
      it("exist as a function but do nothing", () => {
        expect(defaultCache.del).to.not.throw;
      });
    });


  });

});
