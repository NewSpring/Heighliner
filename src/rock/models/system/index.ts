import models, { Rock } from "./model";
import { gql } from "../../../util";
const schema = gql("./schema");
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