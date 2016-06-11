
import { connect } from "./mssql";

import { ApplicationDefinition } from "../util/application";
import { createApplication } from "../util/heighliner";

import People from "./models/people";
import Finances from "./models/finances";
import Campuses from "./models/campuses";
import System from "./models/system";

export const { queries, models, resolvers, mocks, schema } = createApplication([
  People,
  Finances,
  Campuses,
  System,
]);

export default {
  models,
  resolvers,
  mocks,
  schema,
  connect,
} as ApplicationDefinition;
