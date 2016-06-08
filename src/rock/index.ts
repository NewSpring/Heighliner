
import { merge } from "lodash";

import { connect } from "./mssql";

import {
  ApplicationDefinition,
  Resolvers,
  Models,
  Mocks,
} from "../util/application";

import {
  schema as personSchema,
  resolver as Person,
  model as People,
  queries as peopleQueries,
} from "./models/person";



export const schema = [
  ...personSchema,
  // ...fileSchema,
  // ...navigationSchema,
];

export const resolvers = merge(
  Person
) as Resolvers;

export const models = merge(
  People
  // Files,
  // Navigations
) as Models;

// XXX implement pagination instead of skip
// use `after` for ^^
export const queries = [
  ...peopleQueries,
];

export let mocks = merge({
    Query: {
      people() { return {}; },
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
