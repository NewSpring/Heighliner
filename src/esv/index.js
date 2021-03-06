import { connect } from "./fetch";

import { createApplication } from "../util/heighliner";

import Scripture from "./models/scripture";

export const { schema, resolvers, models, queries, mocks } = createApplication([
  Scripture
]);

export default {
  models,
  resolvers,
  mocks,
  schema,
  connect
};
