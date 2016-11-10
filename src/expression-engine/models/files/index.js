import { gql } from "../../../util";
const schema = gql("./schema");
import resolvers from "./resolver";
import models from "./model";
// import mocks from "./mocks";

export default {
  schema,
  resolvers,
  models,
  // mocks,
};
