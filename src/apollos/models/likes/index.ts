import { gql } from "../../../util";
const schema = gql("./schema");
import resolvers from "./resolver";
import models, { LikeDocument } from "./model";
import queries from "./queries";

export default {
  schema,
  resolvers,
  models,
  queries,
};

export {
  LikeDocument
};
