
import { merge } from "lodash";

import { connect } from "./mssql";

import {
  ApplicationDefinition,
  Resolvers,
  Models,
  Mocks,
} from "../util/application";

// XXX make this import standard and less boilerplate
import {
  schema as personSchema,
  resolver as Person,
  model as People,
  queries as peopleQueries,
} from "./models/people";

import {
  schema as financeSchema,
  resolver as Finance,
  model as Finances,
  queries as financeQueries,
} from "./models/finances";

export const schema = [
  ...personSchema,
  ...financeSchema,
  // ...navigationSchema,
];

export const resolvers = merge(
  Person,
  Finance
) as Resolvers;

export const models = merge(
  People,
  Finances
  // Navigations
) as Models;

// XXX implement pagination instead of skip
// use `after` for ^^
export const queries = [
  ...peopleQueries,
  ...financeQueries,
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
