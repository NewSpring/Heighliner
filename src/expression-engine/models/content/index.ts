import { gql } from "../../../util";
const schema = gql("./schema");
import resolver from "./resolver";
import model from "./model";
import tables from "./tables";
import queries from "./queries";
// import mocks from "./mocks";



export {
  tables,
  schema,
  resolver,
  model,
  queries,
  // mocks,
};
