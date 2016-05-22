import { connect as Mongo } from "./connectors/mongo";

import { createSchema } from "./util/graphql";

// Import the apollos application
import Apollos, { queries as ApollosQueries } from "./apollos";

// Merge all applications together
let { schema, connectors, resolvers, mocks } = {
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

const createApp = async () => {

  /*

    Database support

    The following are async attempts to connect to different
    databases. If the db can't be connected, we want to flag it so
    we can load in a mock instead of the db.

    If it is a cache db, we want to bypass it if its not found


  */
  const MONGO = await Mongo(process.env.MONGO_URL || "mongodb://localhost/meteor");
  if (MONGO) mocks = false;


  return (request) => {
    return {
      graphiql: process.env.NODE_ENV != "production",
      pretty: true,
      context: {
        hashedToken: request.headers.authorization,
      },
      connectors,
      resolvers, // required if schema is an array of type definitions
      mocks,
      schema,
    };
  };

};


export {
  createApp,
}
