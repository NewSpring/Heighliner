import { connect } from "./fetch";

import { createApplication } from "../util/heighliner";

import Ooyala from "./models/assets";

export const { schema, resolvers, models, queries, mocks } = createApplication([
  Ooyala,
]);

export default {
  models,
  resolvers,
  mocks,
  schema,
  connect,
};
