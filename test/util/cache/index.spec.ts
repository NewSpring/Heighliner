
import test from "ava";
import casual from "casual";
import { defaultCache, resolvers } from "../../../src/util/cache";
import { InMemoryCache } from "../../../src/util/cache/memory-cache";
import { parseGlobalId } from "../../../src/util/node/model";

test("the cache mutation should delete the id from the cache", async (t) => {
  const id = casual.word,
        data = { test: casual.word },
        cacheData = { [id]: data },
        cache = new InMemoryCache(cacheData);

  const { Mutation } = resolvers;

  function get(_id) {
    return Promise.resolve({ [_id]: { test: casual.word }});
  }
  const context = { cache, models: { Node: { get } } };

  await Mutation.cache(null, { id, type: null }, context);
  t.falsy(cacheData[id]);
});

test("the cache mutation should refetch and save the data in the cache", t => {
  const id = casual.word,
        data = { test: casual.word },
        data2 = { test: casual.word },
        cacheData = { [id]: data },
        cache = new InMemoryCache(cacheData);

  const { Mutation } = resolvers;

  function get(_id) {
    return cache.get(_id, () => (Promise.resolve(data2)));
  }
  const context = { cache, models: { Node: { get } } };

  return Mutation.cache(null, { id, type: null }, context)
    .then((result) => {
      t.deepEqual(result, data2);

      // cache resetting is an async action
      process.nextTick(() => {
        t.deepEqual(result, data2);
        t.pass();
      });
    });
});

test("the cache mutation should allow using a native id an type together", t => {
  const id = casual.word,
        type = casual.word,
        data = { test: casual.word },
        data2 = { test: casual.word },
        cacheData = { [id]: data },
        cache = new InMemoryCache(cacheData);

  const { Mutation } = resolvers;

  function get(_id) {
    const parsed = parseGlobalId(_id);
    t.is(id, parsed.id);
    t.is(type, parsed.__type);
    return cache.get(_id, () => (Promise.resolve(data2)));
  }
  const context = { cache, models: { Node: { get } } };

  return Mutation.cache(null, { id, type }, context)
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
  defaultCache.get(null, () => Promise.resolve(t.pass()));
});

test("defaultCache:set should return true and do nothing", t => {
  return defaultCache.set("test", {})
    .then((success) => {
      if (success) t.pass();
    });
});

test("defaultCache:del exist as a function but do nothing", t => {
  t.notThrows(() => defaultCache.del("string"));
});
