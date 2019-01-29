import { connect } from "./mssql";

import { createApplication } from "../util/heighliner";

import People from "./models/people";
import Finances from "./models/finances";
import Campuses from "./models/campuses";
import System from "./models/system";
import Groups from "./models/groups";
import BinaryFiles from "./models/binary-files";
import Feeds from "./models/feeds";
import Likes from "./models/likes";

export const {
  mutations,
  queries,
  models,
  resolvers,
  mocks,
  schema
} = createApplication([
  People,
  Finances,
  Campuses,
  System,
  Groups,
  BinaryFiles,
  Feeds,
  Likes
]);

export default {
  models,
  mutations,
  resolvers,
  mocks,
  schema,
  connect
};
