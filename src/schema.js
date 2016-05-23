import {
  makeExecutableSchema,
  addMockFunctionsToSchema,
  attachConnectorsToContext,
} from "graphql-tools";

import UserModels from "./apollos/users/model";

import { connect as Mongo, MongoConnector } from "./connectors/mongo";

import {
  createSchema,
  loadApplications,
} from "./util/graphql";

// Import the apollos application
import Apollos, { queries as ApollosQueries } from "./apollos";
import ExpressionEngine, {
  queries as ExpressionEngineQueries,
} from "./expression-engine";



// Merge all applications together
let { schema, models, resolvers, mocks } = loadApplications({
  Apollos,
  // ExpressionEngine,
});

// join all application queries and generate base query
schema = createSchema({
  queries: [
    ...ApollosQueries,
    // ...ExpressionEngineQueries
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


  return async (request) => {

    let context = {
      hashedToken: request.headers.authorization,
    };

    if (context.hashedToken) {
      // we instansiate the
      // bind the logged in user to the context overall
      const Users = new UserModels.Users();
      let user = await Users.getByHashedToken(context.hashedToken);
      context.user = user;
    }
    
    let createdModels = {};
    Object.keys(models).forEach((name) => {
      createdModels[name] = new models[name](context);
    });

    context.models = createdModels;

    return {
      graphiql: process.env.NODE_ENV != "production",
      pretty: false,
      context,
      resolvers, // required if schema is an array of type definitions
      mocks,
      schema,
    };
  };

};


export {
  createApp,
}
