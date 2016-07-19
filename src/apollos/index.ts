
import { connect } from "./mongo";
import Users, { UserDocument } from "./models/users";
import Likes, { LikeDocument } from "./models/likes";

import {  ApplicationDefinition } from "../util/application";
import { createApplication } from "../util/heighliner";

export type UserDocument = UserDocument;
export type LikeDocument = LikeDocument;

export const { schema, resolvers, models, queries, mocks } = createApplication([
  Users,
  Likes,
]);

export default {
  models,
  resolvers,
  mocks,
  schema,
  connect,
} as ApplicationDefinition;
