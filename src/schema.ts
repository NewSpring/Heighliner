import { timeout } from "promise-timeout";

import Node from "./util/node/model";
import {
  InMemoryCache,
  RedisCache,
  RedisConnect,
  Cache,
  } from "./util/cache";

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
import Rock, {
  queries as RockQueries,
  // mutations as RockMutations,
} from "./rock";

// Import Expression Engine
import ExpressionEngine, {
  queries as ExpressionEngineQueries,
} from "./expression-engine";

// Import Google Site Search
import GoogleSS, { queries as GoogleSSQueries } from "./google-site-search";

// Merge all applications together
let { schema, models, resolvers, mocks } = loadApplications({
  Apollos,
  ExpressionEngine,
  Rock,
  GoogleSS,
});

// join all application queries and generate base query
schema = createSchema({
  queries: [
    ...ApollosQueries,
    ...ExpressionEngineQueries,
    ...RockQueries,
    ...GoogleSSQueries,
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
  let cache;
  if (!process.env.CI && !process.env.TEST) {

    // local development
    let dockerhost = "192.168.99.100";

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
      ssl: process.env.MYSQL_SSL || false,
    };
    {
      const { database, user, password } = EESettings;
      const EE = await ExpressionEngine.connect(database, user, password, {
        host: EESettings.host,
        // ssl: MySQLSettings.ssl,
      });
      if (EE) useMocks = false;
    }

    // MSSQL connection
    const RockSettings = {
      host        : process.env.MSSQL_HOST,
      user        : process.env.MSSQL_USER,
      password    : process.env.MSSQL_PASSWORD,
      database    : process.env.MSSQL_DB,
      ssl: process.env.MYSQL_SSL || false,
      dialectOptions: {
        // instanceName: process.env.MSSQL_INSTANCE,
        // connectTimeout: 90000,
      },
    };
    {
      const { database, user, password } = RockSettings;
      const ROCK = await Rock.connect(database, user, password, {
        host: RockSettings.host,
        dialectOptions: RockSettings.dialectOptions,
        // ssl: MySQLSettings.ssl,
      });

      if (ROCK) useMocks = false;
    }

    const REDIS = await RedisConnect(process.env.REDIS_HOST || dockerhost);
    cache = REDIS ? new RedisCache() : new InMemoryCache();

    const SS = await GoogleSS.connect();
    if (SS) useMocks = false;

  }

  // create all of the models on app start up
  let createdModels = {} as any;
  Object.keys(models).forEach((name) => {
    createdModels[name] = new models[name]({ cache });
  });
  createdModels.Node = new Node({ cache, models: createdModels });
  function getIp(request) {
    return request.headers["x-forwarded-for"] ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      request.connection.socket.remoteAddress;
  }
  return {
    cache,
    models: createdModels,
    graphql: async function(request){
      let ip = getIp(request);
      // Anderson, SC
      if (ip === "::1") ip = "2602:306:b81a:c420:ed84:6327:b58e:6a2d";

      let context: any = {
        hashedToken: request.headers.authorization,
        cache,
        ip,
      };

      if (context.hashedToken) {
        // we instansiate the
        // bind the logged in user to the context overall
        let user;
        try {
          user = await timeout(
            createdModels.User.getByHashedToken(context.hashedToken)
          , 500) as UserDocument;
          context.user = user;
        } catch (e) {/* tslint:disable-line */}

        let person;
        if (user && user.services && user.services.rock) {
          try {
            person = await timeout(
              createdModels.Person.getFromAliasId(user.services.rock.PrimaryAliasId)
            , 500);
            person.PrimaryAliasId = user.services.rock.PrimaryAliasId;
          } catch (e) {/* tslint:disable-line */}
        }
        context.person = person;
      }

      context.models = createdModels;

      return {
        graphiql: process.env.NODE_ENV !== "production",
        pretty: false,
        context: context as Context,
        resolvers: useMocks ? false : resolvers, // required if schema is an array of type definitions
        mocks: useMocks ? mocks : false,
        schema,
      };
    },
  };

};

export interface Context {
  hashedToken: string;
  cache: Cache;
  user: UserDocument;
  models: any;
}
