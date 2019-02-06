import casual from "casual";
import { InMemoryCache } from "../memory-cache";

it("`InMemoryCache` should have a way to get items from the cache", () => {
  const id = casual.word;
  const data = { test: casual.word };

  const cacheData = { [id]: data };
  const cache = new InMemoryCache(cacheData);

  return cache
    .get(id, () => Promise.resolve())
    .then(result => {
      expect(result).toEqual(data);
    });
});

it("`InMemoryCache` should use a lookup method if no cache entry exists", () => {
  const id = casual.word;
  const data = { test: casual.word };

  const cacheData = {};
  const cache = new InMemoryCache(cacheData);

  const spyLookup = () => Promise.resolve(data);
  return cache.get(id, spyLookup).then(result => {
    expect(result).toEqual(data);
  });
});

it("`InMemoryCache` should have a way to set items in the cache with a ttl", () => {
  const id = casual.word;
  const data = { test: casual.word };

  const cacheData = {};
  const cache = new InMemoryCache(cacheData);

  const spyLookup = () => Promise.resolve(data);
  return cache
    .get(id, spyLookup, { ttl: 0.1 })
    .then(result => {
      expect(result).toEqual(data);
    })
    .then(
      () =>
        new Promise((c) => {
          setTimeout(() => {
            expect(cacheData[id]).toBeFalsy();
            c();
          }, 0.1 * 60 + 25);
        })
    );
});

it("should have a way to set items in the cache", () => {
  const id = casual.word;
  const data = { test: casual.word };

  const cacheData = {};
  const cache = new InMemoryCache(cacheData);

  return cache.set(id, data).then(() => {
    expect(cacheData[id]).toEqual(data);
  });
});

it("should eventually return true if successfully set", () => {
  const id = casual.word;
  const data = { test: casual.word };

  const cacheData = {};
  const cache = new InMemoryCache(cacheData);

  return cache.set(id, data).then(success => {
    expect(cacheData[id]).toEqual(data);
    expect(success).toBeTruthy();
  });
});

it("should have a way to set items in the cache with a ttl", () => {
  const id = casual.word;
  const data = { test: casual.word };

  const cacheData = {};
  const cache = new InMemoryCache(cacheData);

  return cache
    .set(id, data, 0.1)
    .then(() => {
      expect(cacheData[id]).toEqual(data);
    })
    .then(
      () =>
        new Promise((c) => {
          setTimeout(() => {
            expect(cacheData[id]).toBeFalsy();
            c();
          }, 0.1 * 60 + 25);
        })
    );
});

it("`InMemoryCache` should allow removing existing cache entries", () => {
  const id = casual.word;
  const data = { test: casual.word };

  const cacheData = { [id]: data };
  const cache = new InMemoryCache(cacheData);

  cache.del(id);
  expect(cacheData[id]).toBeFalsy();
});
