import { gql } from "../../util"
const schema = gql("./schema");
import resolver from "./resolver";
import connector from "./connector";
import mocks from "./mocks";

export {
  schema,
  resolver,
  connector,
  mocks,
}
