

import { InMemoryCache } from "./memory-cache";
import {
  RedisCache,
  connect as RedisConnect,
} from "./redis";

import {
  defaultCache,
  resolvers,
  mutations,
} from "./defaults";

export {
  InMemoryCache,
  RedisCache,
  RedisConnect,
  defaultCache,
  resolvers,
  mutations,
};
