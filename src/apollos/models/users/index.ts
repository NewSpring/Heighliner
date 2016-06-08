import { gql } from "../../../util";
const schema = gql("./schema");
import resolver from "./resolver";
import model, { UserDocument } from "./model";
import mocks from "./mocks";
import queries from "./queries";

export {
  schema,
  resolver,
  model,
  mocks,
  queries,
  UserDocument,
};
