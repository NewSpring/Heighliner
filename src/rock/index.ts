
import { merge, difference } from "lodash";

import { connect } from "./mssql";

import {
  ApplicationDefinition,
  Resolvers,
  Models,
  Mocks,
} from "../util/application";

// import {
//   schema as contentSchema,
//   resolver as Content,
//   model as Contents,
// } from "./content";



export const schema = [
  // ...contentSchema,
  // ...fileSchema,
  // ...navigationSchema,
];

export const resolvers = merge(
  {
    Query: {
    },
  }
) as Resolvers;

export const models = merge(
  {}
  // Contents,
  // Files,
  // Navigations
) as Models;

// XXX implement pagination instead of skip
// use `after` for ^^
export const queries = [
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
