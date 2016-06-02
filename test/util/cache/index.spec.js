
import test from "ava";
import casual from "casual";
import { defaultCache, resolvers } from "../../../lib/util/cache";
import { InMemoryCache } from "../../../lib/util/cache/memory-cache";

test("the cache mutation should delete the id from the cache", async t => {
  const id = casual.word,
        data = { test: casual.word },
        cacheData = { [id]: data },
        cache = new InMemoryCache(cacheData);

  const { Mutation } = resolvers;

  function get(id) {
    return Promise.resolve({ [id]: { test: casual.word }});
  }
  const context = { cache, models: { Node: { get } } };

  const result = await Mutation.cache(null, { id }, context)

  t.falsy(cacheData[id]);
});

test("the cache mutation should refetch and save the data in the cache", t => {
  const id = casual.word,
        data = { test: casual.word },
        data2 = { test: casual.word },
        cacheData = { [id]: data },
        cache = new InMemoryCache(cacheData);

  const { Mutation } = resolvers;

  function get(id) {
    return cache.get(id, () => (Promise.resolve(data2)));
  }
  const context = { cache, models: { Node: { get } } };

  return Mutation.cache(null, { id }, context)
    .then((result) => {
      t.deepEqual(result, data2);

      // cache resetting is an async action
      process.nextTick(() => {
        t.deepEqual(result, data2);
        t.pass();
      });
    });
});

test("defaultCache:get should simply run the lookup method", t => {
  defaultCache.get(null, () => {
    t.pass();
  });
});

test("defaultCache:set should return true and do nothing", t => {
  return defaultCache.set()
    .then((success) => {
      t.true(success);
    });
});

test("defaultCache:del exist as a function but do nothing", t => {
  t.notThrows(defaultCache.del);
});
