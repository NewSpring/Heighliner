import { gql } from "../../util"
const schema = gql("./schema");
import resolver from "./resolver";
import connector from "./connector";

export {
  schema,
  resolver,
  connector,
}
