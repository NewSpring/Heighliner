
import { connect } from "./fetch";

import {  ApplicationDefinition } from "../util/application";
import { createApplication } from "../util/heighliner";

import Search from "./models/search";

export const { schema, resolvers, models, queries, mocks } = createApplication([
  Search,
]);

export default {
  models,
  resolvers,
  mocks,
  schema,
  connect,
} as ApplicationDefinition;
