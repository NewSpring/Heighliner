import { gql } from "../../../util";
const schema = gql("./schema");
import resolver from "./resolver";
import model from "./model";
import queries from "./queries";
// import mocks from "./mocks";

export {
  schema,
  resolver,
  model,
  queries,
  // mocks,
};
