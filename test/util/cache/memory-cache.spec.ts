
import test from "ava";
import casual from "casual";
import { InMemoryCache } from "../../../src/util/cache/memory-cache";

test("`InMemoryCache` should have a way to get items from the cache", async (t) => {
  const id = casual.word;
  const data = { test: casual.word };

  const cacheData = { [id]: data };
  const cache = new InMemoryCache(cacheData);

  const result = await cache.get(id, () => Promise.resolve());
  t.deepEqual(result, data);
});

test("`InMemoryCache` should use a lookup method if no cache entry exists", async (t) => {
  const id = casual.word;
  const data = { test: casual.word };

  const cacheData = {};
  const cache = new InMemoryCache(cacheData);

  const spyLookup = () => {
    return Promise.resolve(data);
  };

  const result = await cache.get(id, spyLookup);
  t.deepEqual(result, data);
});

test("`InMemoryCache` should have a way to set items in the cache with a ttl", t => {
  const id = casual.word;
  const data = { test: casual.word };

  const cacheData = {};
  const cache = new InMemoryCache(cacheData);

  const spyLookup = () => {
    return Promise.resolve(data);
  };

  cache.get(id, spyLookup, { ttl: .1 })
    .then((result) => {
      t.deepEqual(result, data);
    });

  setTimeout(() => {
    t.falsy(cacheData[id]);
    t.pass();
  }, (.1 * 60) + 25);

});


test("should have a way to set items in the cache", async (t) => {
  const id = casual.word;
  const data = { test: casual.word };

  const cacheData = {};
  const cache = new InMemoryCache(cacheData);

  await cache.set(id, data);

  t.deepEqual(cacheData[id], data);
});

test("should eventually return true if successfully set", async (t) => {
  const id = casual.word;
  const data = { test: casual.word };

  const cacheData = {};
  const cache = new InMemoryCache(cacheData);

  const success = await cache.set(id, data);

  t.deepEqual(cacheData[id], data);
  t.true(success);
});

test("should have a way to set items in the cache with a ttl", async (t) => {
  const id = casual.word;
  const data = { test: casual.word };

  const cacheData = {};
  const cache = new InMemoryCache(cacheData);

  await cache.set(id, data, .1);

  t.deepEqual(cacheData[id], data);

  setTimeout(() => {
    t.falsy(cacheData[id]);
  }, (.1 * 60) + 25);

});

test("`InMemoryCache` should allow removing existing cache entries", t => {
  const id = casual.word;
  const data = { test: casual.word };

  const cacheData = { [id]: data };
  const cache = new InMemoryCache(cacheData);

  cache.del(id);
  t.falsy(cacheData[id]);
});
