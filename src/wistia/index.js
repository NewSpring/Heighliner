import { connect } from "./fetch";

import { createApplication } from "../util/heighliner";

import Wistia from "./models/wistia";

export const { mutations, schema, resolvers, models, queries, mocks } = createApplication([
  Wistia,
]);

export default {
  mutations,
  models,
  resolvers,
  mocks,
  schema,
  connect,
};
