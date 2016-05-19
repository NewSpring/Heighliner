
import { createSchema } from "./util/graphql";

// Import the apollos application
import Apollos, { queries as ApollosQueries } from "./apollos";


// Merge all applications together
let { schema, connectors, resolvers } = {
  ...Apollos,
};

// join all application queries and generate base query
schema = createSchema({
  queries: [
    ...ApollosQueries,
  ],
  // mutations: [
  //
  // ],
  schema
});

export {
  schema,
  connectors,
  resolvers,
}
