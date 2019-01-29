import { connect } from "./fetch";

import { createApplication } from "../util/heighliner";

import Search from "./models/search";
import Geolcate from "./models/geolocate";

export const { schema, resolvers, models, queries, mocks } = createApplication([
  Search,
  Geolcate
]);

export default {
  models,
  resolvers,
  mocks,
  schema,
  connect
};
