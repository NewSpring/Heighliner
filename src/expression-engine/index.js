
import {
  schema as contentSchema,
  resolver as Contents,
  model as Content,
} from "./content";

export const schema = [
  ...contentSchema,
];

export const resolvers = {
  Query: {
    content(_, args, { models }){
      return {};
      // return models.Content.find(args);
    },
  },
  ...Contents,
};

export const models = {
  ...Content,
};

export const queries = [
  "content(site: String, after: Int, first: Int): Content"
];

export default {
  models,
  resolvers,
  schema,
};
