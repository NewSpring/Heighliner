import Url from "url";
import { User } from "./apollos/users/model";
import Node from "./util/node/model";
import { InMemoryCache, Cache } from "./util/cache";

import {
  createSchema,
  loadApplications,
} from "./util/heighliner";

// Import Apollos
import Apollos, {
  queries as ApollosQueries,
  // mutations as ApollosMutations,
  UserDocument,
} from "./apollos";

// Import Rock
// import Rock, {
//   queries as RockQueries,
//   mutations as RockMutations,
// } from "./rock";

// Import Expression Engine
import ExpressionEngine, {
  queries as ExpressionEngineQueries,
} from "./expression-engine";

// Import Google Site Search
// import GoogleSS, { queries as GoogleSSQueries } from "./google-site-search";


// Merge all applications together
let { schema, models, resolvers, mocks } = loadApplications({
  Apollos,
  ExpressionEngine,
  // Rock,
  // GoogleSS,
});

// join all application queries and generate base query
schema = createSchema({
  queries: [
    ...ApollosQueries,
    ...ExpressionEngineQueries,
    // ...RockQueries,
    // ...GoogleSSQueries,
  ],
  mutations: [
    // ...ApollosMutations,
    // ...RockMutations,
  ],
  schema,
});

export async function createApp() {

  let useMocks = true;
  /*

    Database support

    The following are async attempts to connect to different
    databases. If the db can't be connected, we want to flag it so
    we can load in a mock instead of the db.

    If it is a cache db, we want to bypass it if its not found


  */
  let cacheType;
  if (!process.env.CI) {

    // local development handling for docker-machine ips being different
    let dockerhost = "192.168.99.100"
    if (process.env.DOCKER_HOST) {
      const hostObj = Url.parse(process.env.DOCKER_HOST)
      dockerhost = hostObj.host
    }

    // MONGO
    const APOLLOS = await Apollos.connect(process.env.MONGO_URL || "mongodb://localhost/meteor");
    // XXX find a way to just use mocks for Apollos
    if (APOLLOS) useMocks = false;


    // MySQL connections
    const EESettings = {
      host        : process.env.MYSQL_HOST || dockerhost,
      user        : process.env.MYSQL_USER || "root",
      password    : process.env.MYSQL_PASSWORD || "password",
      database    : process.env.MYSQL_DB || "ee_local",
      ssl: process.env.MYSQL_SSL || false
    };
    const { database, user, password } = EESettings;
    const EE = await ExpressionEngine.connect(database, user, password, {
      host: EESettings.host,
      // ssl: MySQLSettings.ssl,
    });
    if (EE) useMocks = false;
  }

  const cache = new InMemoryCache();

  return async function(request){

    let context: any = {
      hashedToken: request.headers.authorization,
      cache,
    };

    if (context.hashedToken) {
      // we instansiate the
      // bind the logged in user to the context overall
      const Users = new User(context);
      let user = await Users.getByHashedToken(context.hashedToken);
      context.user = user;
    }

    let createdModels = {};
    Object.keys(models).forEach((name) => {
      createdModels[name] = new models[name](context);
    });

    context.models = createdModels;
    context.models.Node = new Node(context);

    return {
      graphiql: process.env.NODE_ENV != "production",
      pretty: false,
      context: context as Context,
      resolvers: useMocks ? false: resolvers, // required if schema is an array of type definitions
      mocks: useMocks ? mocks : false,
      schema,
    };
  };

};

export interface Context {
  hashedToken: string
  cache: Cache
  user: UserDocument
  models: any
}
