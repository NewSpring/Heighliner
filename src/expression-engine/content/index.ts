import { gql } from "../../util";
const schema = gql("./schema");
import resolver from "./resolver";
import model from "./model";
// import mocks from "./mocks";

export {
  schema,
  resolver,
  model,
  // mocks,
};
