import casual from "casual";
import { defaultCache, resolvers } from "../defaults";
import { InMemoryCache } from "../memory-cache";
import { parseGlobalId } from "../../node/model";

it("the cache mutation should delete the id from the cache", () => {
  const id = casual.word,
    data = { test: casual.word },
    cacheData = { [id]: data },
    cache = new InMemoryCache(cacheData);

  const { Mutation } = resolvers;

  function get(_id) {
    return Promise.resolve({ [_id]: { test: casual.word } });
  }
  const context = { cache, models: { Node: { get } } };

  return Mutation.cache(null, { id, type: null }, context).then(() => {
    expect(cacheData[id]).toBeFalsy;
  });
});

it("the cache mutation should refetch and save the data in the cache", () => {
  const id = casual.word,
    data = { test: casual.word },
    data2 = { test: casual.word },
    cacheData = { [id]: data },
    cache = new InMemoryCache(cacheData);

  const { Mutation } = resolvers;

  function get(_id) {
    return cache.get(_id, () => Promise.resolve(data2));
  }
  const context = { cache, models: { Node: { get } } };

  return Mutation.cache(null, { id, type: null }, context).then(result => {
    expect(result).toEqual(data2);

    return new Promise((c, r) => {
      // cache resetting is an async action
      process.nextTick(() => {
        expect(result).toEqual(data2);
        c();
      });
    });
  });
});

it(
  "the cache mutation should allow using a native id and type together",
  () => {
    const id = casual.word,
      type = casual.word,
      data = { test: casual.word },
      data2 = { test: casual.word },
      cacheData = { [id]: data },
      cache = new InMemoryCache(cacheData);

    const { Mutation } = resolvers;

    function get(_id) {
      const parsed = parseGlobalId(_id);
      expect(id).toEqual(parsed.id);
      expect(type).toEqual(parsed.__type);
      return cache.get(_id, () => Promise.resolve(data2));
    }
    const context = { cache, models: { Node: { get } } };

    return Mutation.cache(null, { id, type }, context).then(result => {
      expect(result).toEqual(data2);

      return new Promise((c, r) => {
        // cache resetting is an async action
        process.nextTick(() => {
          expect(result).toEqual(data2);
          c();
        });
      });
    });
  },
);

// XXX how to test this
it(
  "defaultCache:get should simply run the lookup method",
  () => defaultCache.get(null, () => Promise.resolve()),
);

it(
  "defaultCache:set should return true and do nothing",
  () => defaultCache.set("test", {}).then(success => {
    if (!success) throw new Error();
    expect(true).toBe(true);
  }),
);

it("defaultCache:del exist as a function but do nothing", () => {
  expect(() => defaultCache.del("string")).not.toThrow();
});
