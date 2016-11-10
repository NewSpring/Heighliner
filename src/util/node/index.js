
import { gql } from "../graphql";
const schema = gql("./schema");
import resolver from "./resolver";
import model, { createGlobalId, parseGlobalId } from "./model";
import mocks from "./mocks";

export {
  schema,
  resolver,
  mocks,
  model,
  createGlobalId,
  parseGlobalId,
};
