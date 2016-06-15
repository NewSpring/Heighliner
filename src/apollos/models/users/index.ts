import { gql } from "../../../util";
const schema = gql("./schema");
import resolvers from "./resolver";
import models, { UserDocument } from "./model";
import mocks from "./mocks";
import queries from "./queries";

export default {
  schema,
  resolvers,
  models,
  mocks,
  queries,
};

export {
  UserDocument
};
