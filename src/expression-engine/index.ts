
import { merge } from "lodash";

import { connect } from "./mysql";

import {
  ApplicationDefinition,
  Resolvers,
  Models,
  Mocks,
} from "../util/application";

import {
  schema as contentSchema,
  resolver as Content,
  model as Contents,
} from "./content";

export const schema = [
  ...contentSchema,
];

export const resolvers = merge(
  {
    Query: {
      content(_, { channel, collection, limit, skip, status }, { models }){
        return models.Content.find(channel, { limit, offset: skip, status });
      },
    },
  },
  Content
) as Resolvers;

export const models = merge(
  Contents
) as Models;

// XXX implement pagination instead of skip
// use `after` for ^^
export const queries = [
  `content(channel: String!, collection: ID, limit: Int = 20, skip: Int = 0, status: String = "open"): [Content]`,
];

export let mocks = merge({
    Query: {
      content() { return {}; },
    },
  }
  // userMocks
) as Mocks;

export default {
  models,
  resolvers,
  mocks,
  schema,
  connect,
} as ApplicationDefinition;