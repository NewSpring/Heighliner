import { gql } from "../../../util";
import schema from "!!raw!./schema.graphql";
import resolvers from "./resolver";
import models from "./model";
import queries from "./queries";

export default {
  schema,
  resolvers,
  models,
  queries,
};
