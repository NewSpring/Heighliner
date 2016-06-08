import { merge } from "lodash";

import { connect } from "./mongo";

import {
  schema as userSchema,
  mocks as userMocks,
  resolver as User,
  model as Users,
  queries as userQueries,
  UserDocument,
} from "./models/users";

import {
  ApplicationDefinition,
  Resolvers,
  Models,
  Mocks,
} from "../util/application";

export type UserDocument = UserDocument;

export const schema = [
  ...userSchema,
];

export const resolvers = merge(
  User
) as Resolvers;

export const models = merge(
  Users
) as Models;

export const queries = [
  ...userQueries,
];

export let mocks = merge({
    Query: {
      currentUser() { return {}; },
    },
  },
  userMocks
) as Mocks;

export default {
  models,
  resolvers,
  mocks,
  schema,
  connect,
} as ApplicationDefinition;
