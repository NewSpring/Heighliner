
import { merge } from "lodash";

import {
  schema as nodeSchema,
  resolver as nodeResolver,
  mocks as nodeMocks,
} from "./node";

import {
  resolvers as cacheResolver,
  mutations as cacheMutation,
} from "./cache/defaults";

export function getIp(request) {
  return request.headers["x-forwarded-for"] ||
    request.connection.remoteAddress ||
    request.socket.remoteAddress ||
    request.connection.socket.remoteAddress;
}

export function createQueries(queries) {
  return [`
    type Query {
      ${queries.join("\n")}
      node(id: ID!): Node
    }
  `];
}

export function createMutations(mutations = []) {
  return [`
    type Mutation {
      ${mutations.join("\n")}
      ${cacheMutation.join("\n")}
    }
  `];
}

export function createApplication(models) {
  const joined = {
    schema: [],
    models: {},
    resolvers: {},
    queries: [],
    mutations: [],
  };

  for (const model of models) {
    joined.schema = [...joined.schema, ...model.schema];
    joined.models = merge(joined.models, model.models);
    joined.resolvers = merge(joined.resolvers, model.resolvers);

    if (model.queries) joined.queries = [...joined.queries, ...model.queries];
    if (model.mutations) joined.mutations = [...joined.mutations, ...model.mutations];
  }

  return joined;
}

export function loadApplications(applications) {
  const joined = {
    schema: [...nodeSchema],
    models: {},
    resolvers: merge({}, nodeResolver, cacheResolver),
    mocks: merge({}, nodeMocks),
  };

  Object.keys(applications).forEach((name) => {
    const app = applications[name];
    joined.schema = [...joined.schema, ...app.schema];
    joined.models = merge(joined.models, app.models);
    joined.resolvers = merge(joined.resolvers, app.resolvers);
  });

  // dynmically create the root query mock
  const queries = merge({}, joined.mocks.Query);
  joined.mocks.Query = () => queries;

  // XXX dynamically create the root mutation mock
  const mutations = merge({}, joined.mocks.Mutation);
  joined.mocks.Mutation = () => mutations;

  return joined;
}

export function createSchema({ queries, schema, mutations }) {
  // build base level schema
  const root = [`
    schema {
      query: Query
      mutation: Mutation
    }
  `];

  const query = createQueries(queries);
  const mutation = createMutations(mutations);

  // generate the final schema
  return [
    ...root,
    ...query,
    ...mutation,
    ...schema,
  ];
}
