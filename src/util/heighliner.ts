import { merge } from "lodash";

import {
  schema as nodeSchema,
  resolver as nodeResolver,
  mocks as nodeMocks,
} from "./node";

import {
  resolvers as cacheResolver,
  mutations as cacheMutation,
} from "./cache";

import {
  ApplicationDefinition,
  SchemaShorthand,
} from "./application";

export function createQueries(queries: string[]): string[] {
  return [`
    type Query {
      ${queries.join("\n")}
      node(id: ID!): Node
    }
  `];
}

export function createMutations(mutations: string[] = []): string[] {
  return [`
    type Mutation {
      ${mutations.join("\n")}
      ${cacheMutation.join("\n")}
    }
  `];
}

export function createApplication(models: ApplicationDefinition[]): ApplicationDefinition {
  const joined = {
    schema: [],
    models: {},
    resolvers: {},
    mocks: {},
    queries: [],
  } as ApplicationDefinition;

  for (let model of models) {
    joined.schema = [...joined.schema, ...model.schema];
    joined.models = merge(joined.models, model.models);
    joined.resolvers = merge(joined.resolvers, model.resolvers);

    if (model.queries) joined.queries = [...joined.queries, ...model.queries];
    if (model.mocks) joined.mocks = merge(joined.mocks, model.mocks);
  }

  return joined;
}

export function loadApplications(applications: { [key: string]: ApplicationDefinition }): ApplicationDefinition {

  const joined = {
    schema: [...nodeSchema],
    models: {},
    resolvers: merge({}, nodeResolver, cacheResolver),
    mocks: merge({}, nodeMocks),
  } as ApplicationDefinition;

  Object.keys(applications).forEach((name: string) => {
    let app: ApplicationDefinition = applications[name];
    joined.schema = [...joined.schema, ...app.schema];
    joined.models = merge(joined.models, app.models);
    joined.resolvers = merge(joined.resolvers, app.resolvers);
    if (app.mocks) joined.mocks = merge(joined.mocks, app.mocks);
  });

  // dynmically create the root query mock
  const queries = merge({}, joined.mocks.Query);
  joined.mocks.Query = () => queries;

  // XXX dynamically create the root mutation mock

  return joined;
}

export function createSchema({ queries, schema, mutations }: SchemaShorthand): string[] {

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
