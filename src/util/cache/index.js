import { InMemoryCache } from "./memory-cache";
import { RedisCache, connect as RedisConnect } from "./redis";

import { defaultCache, resolvers, mutations } from "./defaults";

export async function createCache(monitor) {
  const datadog = monitor && monitor.datadog;
  const REDIS = await RedisConnect({ datadog });
  return REDIS ? new RedisCache() : new InMemoryCache();
}

export {
  InMemoryCache,
  RedisCache,
  RedisConnect,
  defaultCache,
  resolvers,
  mutations,
};
