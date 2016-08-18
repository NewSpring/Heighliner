import { timeout } from "promise-timeout";
import Raven, { parsers } from "raven";
import { makeExecutableSchema, addMockFunctionsToSchema } from "graphql-tools";
import { GraphQLSchema } from "graphql";
import { Tracer, addTracingToResolvers } from "graphql-tracer";

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
  mutations as ApollosMutations,
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

// Import ESV API
import ESV, { queries as ESVQueries } from "./esv";

// Merge all applications together
let { schema, models, resolvers, mocks } = loadApplications({
  Apollos,
  ExpressionEngine,
  Rock,
  GoogleSS,
  ESV,
});

// join all application queries and generate base query
schema = createSchema({
  queries: [
    ...ApollosQueries,
    ...ExpressionEngineQueries,
    ...RockQueries,
    ...GoogleSSQueries,
    ...ESVQueries,
  ],
  mutations: [
    ...ApollosMutations,
    // ...RockMutations,
  ],
  schema,
});

const executabledSchema = makeExecutableSchema({
  typeDefs: schema,
  resolvers,
  allowUndefinedInResolve: true, // required for resolvers
}) as GraphQLSchema;

let tracer;
if (process.env.TRACER_APP_KEY && !process.env.TEST) {
  tracer = new Tracer({ TRACER_APP_KEY: process.env.TRACER_APP_KEY });
  addTracingToResolvers(executabledSchema);
}


if (process.env.TEST) {
  addMockFunctionsToSchema({
    schema: executabledSchema,
    preserveResolvers: true,
    mocks,
  });
}

export async function createApp(monitor?) {
  const datadog = monitor && monitor.datadog;
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

    // XXX add in dynamic docker host development
    let dockerhost = "192.168.99.100";

    // MONGO
    const APOLLOS = await Apollos.connect(process.env.MONGO_URL, { datadog });
    // XXX find a way to just use mocks for Apollos
    if (APOLLOS) {
      console.log("CONNECTION: Apollos ✓"); // tslint:disable-line
      useMocks = false;
    }

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
        ssl: EESettings.ssl,
      }, { datadog });
      if (EE) {
        console.log("CONNECTION: EE ✓"); // tslint:disable-line
        useMocks = false;
      }
    }

    // MSSQL connection
    const RockSettings = {
      host        : process.env.MSSQL_HOST,
      user        : process.env.MSSQL_USER,
      password    : process.env.MSSQL_PASSWORD,
      database    : process.env.MSSQL_DB,
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
      }, { datadog });

      if (ROCK) {
        console.log("CONNECTION: Rock ✓"); // tslint:disable-line
        useMocks = false;
      }
    }

    const REDIS = await RedisConnect(process.env.REDIS_HOST || dockerhost, 6379, { datadog });
    cache = REDIS ? new RedisCache() : new InMemoryCache();
    if (REDIS) console.log("CONNECTION: Redis ✓"); // tslint:disable-line

    const SS = await GoogleSS.connect();
    if (SS) useMocks = false;

    const ESVConnection = await ESV.connect();
    if (ESVConnection) useMocks = false;

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
      if (request && request.body && request.body.operationName) {
        const { operationName } = request.body;
        if (datadog) datadog.increment(`graphql.operation.${operationName}`);
      }

      if (datadog) datadog.increment("graphql.request");
      let ip = getIp(request);
      // tslint:disable-next-line
      // Anderson, SC
      if (ip === "::1") ip = "2602:306:b81a:c420:ed84:6327:b58e:6a2d";

      let context: any = {
        hashedToken: request.headers.authorization,
        cache,
        ip,
      };

      if (context.hashedToken) {
        if (datadog) datadog.increment("graphql.authenticated.request");
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

      if (process.env.NODE_ENV === "production") {
        const sentry = new Raven.Client(process.env.SENTRY);
        context.sentry = sentry;
        if (context.person) {
          sentry.setUserContext({ email: context.person.Email, id: context.person.PersonId });
        }
      }

      return {
        context: context as Context,
        schema: executabledSchema,
        formatParams: params => {
          if (!tracer) return params;
          const logger = tracer.newLoggerInstance();
          logger.log("request.info", {
            headers: request.headers,
            baseUrl: request.baseUrl,
            originalUrl: request.originalUrl,
            method: request.method,
            httpVersion: request.httpVersion,
            remoteAddr: request.connection.remoteAddress,
          });
          params.logFunction = logger.log;
          params.context.tracer = logger;
          return params;
        },
        formatResponse: (response, data) => {
          if (data.context.tracer) data.context.tracer.submit();
          return response;
        },
        formatError:  error => {
          if (process.env.NODE_ENV === "production") {
            if (datadog) datadog.increment("graphql.error");
            context.sentry.captureError(error, parsers.parseRequest(request));
          }
          return {
            message: error.message,
            locations: error.locations,
            stack: error.stack,
          };
        },
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
