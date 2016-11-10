import models, { Rock } from "./model";
import schema from "!!raw!./schema.graphql";
import resolvers from "./resolver";
import queries from "./queries";
// import mocks from "./mocks";

export default {
  schema,
  resolvers,
  models,
  queries,
  // mocks,
};

export { Rock };
