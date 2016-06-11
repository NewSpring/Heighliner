
import { connect } from "./mongo";
import Users, { UserDocument } from "./models/users";

import {  ApplicationDefinition } from "../util/application";
import { createApplication } from "../util/heighliner";

export type UserDocument = UserDocument;

export const { schema, resolvers, models, queries, mocks } = createApplication([
  Users,
]);

export default {
  models,
  resolvers,
  mocks,
  schema,
  connect,
} as ApplicationDefinition;
