
import schema from "!!raw!./schema.graphql";
import resolver from "./resolver";
import model, { createGlobalId, parseGlobalId } from "./model";

export {
  schema,
  resolver,
  model,
  createGlobalId,
  parseGlobalId,
};
