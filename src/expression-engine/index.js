import { connect } from "./mysql";

import { createApplication } from "../util/heighliner";

import Content from "./models/content";
import Files from "./models/files";
import Navigation from "./models/navigation";

export const { models, resolvers, mocks, schema, queries } = createApplication([
  Content,
  Files,
  Navigation,
]);

export default {
  models,
  resolvers,
  mocks,
  schema,
  connect,
};
