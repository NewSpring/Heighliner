
import { Cache } from "./cache";
import { InMemoryCache } from "./memory-cache";

import { createGlobalId } from "../node/model";

export {
  Cache,
  InMemoryCache,
}

export const defaultCache: Cache = {
  get(id: string, lookup: () => Promise<Object | void>){
    return Promise.resolve().then(lookup);
  },
  set(id: string){ return Promise.resolve().then(() => true); },
  del(){},
}

export const resolvers = {
  Mutation: {
    cache(_,
      { id, type }: { id: string, type: string },
      { cache, models }
    ): Promise<Object | void> {
      if (type && id) {
        id = createGlobalId(id, type);
      }
      return Promise.resolve()
        .then(() => cache.del(id))
        .then(() => models.Node.get(id));
    },
  },
}

export const mutations = [
  "cache(id: ID!, type: String): Node",
];
