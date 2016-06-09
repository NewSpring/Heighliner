import Url from "url";
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
// import GoogleSS, { queries as GoogleSSQueries } from "./google-site-search";

import { Person } from "./rock/models/people/model";
import { User } from "./apollos/models/users/model";

// Merge all applications together
let { schema, models, resolvers, mocks } = loadApplications({
  Apollos,
  ExpressionEngine,
  Rock,
  // GoogleSS,
});

// join all application queries and generate base query
schema = createSchema({
  queries: [
    ...ApollosQueries,
    ...ExpressionEngineQueries,
    ...RockQueries,
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
  let cache;
  if (!process.env.CI) {

    // local development
    let dockerhost = "192.168.99.100"

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
      }
    }
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
    if (REDIS) {
      cache = new RedisCache();
    } else {
      cache = new InMemoryCache();
    }

  }

  return async function(request){

    let context: any = {
      hashedToken: request.headers.authorization,
      cache,
    };

    if (context.hashedToken) {
      // we instansiate the
      // bind the logged in user to the context overall
      // XXX should we remove the `User` and `People models from `models`?
      const Users = new User(context);
      let user = await Users.getByHashedToken(context.hashedToken);
      context.user = user;

      let person;
      const Peoples = new Person(context);
      if (user) {
        person = await Peoples.getFromAliasId(user.services.rock.PrimaryAliasId);
        person.PrimaryAliasId = user.services.rock.PrimaryAliasId;
      }
      context.person = person;
    }

    let createdModels = {};
    Object.keys(models).filter(x => (x != "User" && x != "People")).forEach((name) => {
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
