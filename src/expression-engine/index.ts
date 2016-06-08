
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
  queries as contentQueries,
} from "./models/content";

import {
  schema as fileSchema,
  resolver as File,
  model as Files,
} from "./models/files";

import {
  schema as navigationSchema,
  resolver as Navigation,
  model as Navigations,
  queries as navigationQueries,
} from "./models/navigation";

export const schema = [
  ...contentSchema,
  ...fileSchema,
  ...navigationSchema,
];

export const resolvers = merge(
  Content,
  File,
  Navigation
) as Resolvers;

export const models = merge(
  Contents,
  Files,
  Navigations
) as Models;

export const queries = [
  ...contentQueries,
  ...navigationQueries,
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
