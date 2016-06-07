
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
} from "./person";



export const schema = [
  ...personSchema,
  // ...fileSchema,
  // ...navigationSchema,
];

export const resolvers = merge(
  {
    Query: {
      people: (_, { email }, { models }) => models.People.findByEmail(email),
      currentPerson: (_: any, args: any, { person }: any): any => person,
    },
  },
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
  `people(email: String): [Person]`,
  `currentPerson: Person`
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
