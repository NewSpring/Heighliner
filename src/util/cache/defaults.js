import { createGlobalId } from "../node/model";

export const defaultCache = {
  get: ({lookup}) => Promise.resolve().then(lookup),
  set: () => Promise.resolve().then(() => true),
  del() {},
  encode: (obj, prefix) => `${prefix}${JSON.stringify(obj)}`
};

export const resolvers = {
  Mutation: {
    cache(_, { id, type }, { cache, models }) {
      if (type && id) id = createGlobalId(id, type); // eslint-disable-line
      return Promise.resolve()
        .then(() => cache.del(id))
        .then(() => models.Node.get(id));
    }
  }
};

export const mutations = ["cache(id: ID!, type: String): Node"];
