import { graphqlExpress as apolloExpress } from "apollo-server-express";
import { timeout } from "promise-timeout";
import Raven, { parsers } from "raven";
import { makeExecutableSchema } from "graphql-tools";

import Node from "../util/node/model";
import { createCache } from "../util/cache";
import { createSchema, loadApplications, getIp } from "../util/heighliner";

// Import Apollos
import Apollos, {
  queries as ApollosQueries,
  mutations as ApollosMutations
} from "../apollos";

// Import Rock
import Rock, {
  queries as RockQueries,
  mutations as RockMutations
} from "../rock";

// Import Expression Engine
import ExpressionEngine, {
  queries as ExpressionEngineQueries
} from "../expression-engine";

// Import Google Site Search
import GoogleSS, { queries as GoogleSSQueries } from "../google-site-search";

// Import ESV API
import ESV, { queries as ESVQueries } from "../esv";

// Merge all applications together
// eslint-ignore-next-line
let { schema, models, resolvers } = loadApplications({
  Apollos,
  ExpressionEngine,
  Rock,
  GoogleSS,
  ESV
});

// join all application queries and generate base query
schema = createSchema({
  queries: [
    ...ApollosQueries,
    ...ExpressionEngineQueries,
    ...RockQueries,
    ...GoogleSSQueries,
    ...ESVQueries
  ],
  mutations: [...ApollosMutations, ...RockMutations],
  schema
});

const executabledSchema = makeExecutableSchema({
  typeDefs: schema,
  resolvers,
  allowUndefinedInResolve: true // required for resolvers
});

export function createModels({ cache }) {
  // create all of the models on app start up
  const createdModels = {};
  Object.keys(models).forEach(name => {
    createdModels[name] = new models[name]({ cache });
  });

  createdModels.Node = new Node({ cache, models: createdModels });
  return createdModels;
}

export default function(app, monitor) {
  const datadog = monitor && monitor.datadog;

  const graphql = async request => {
    let cache;
    // connect to all dbs
    await Promise.all([
      createCache({ datadog }),
      Apollos.connect({ datadog }),
      ExpressionEngine.connect({ datadog }),
      Rock.connect({ datadog }),
      GoogleSS.connect(),
      ESV.connect()
    ]).then(([REDIS]) => {
      cache = REDIS;
    });

    // build the models
    const createdModels = createModels({ cache });

    // log some stuff to datadog
    if (request && request.body && request.body.operationName) {
      const { operationName } = request.body;
      if (datadog) datadog.increment(`graphql.operation.${operationName}`);
    }

    if (datadog) datadog.increment("graphql.request");

    // get IP address
    let ip = getIp(request);
    // Anderson, SC
    if (ip === "::1") ip = "2602:306:b81a:c420:ed84:6327:b58e:6a2d";

    const context = {
      authToken: request.headers.authorization,
      cache,
      ip,
      req: request
    };

    if (context.authToken) {
      if (datadog) datadog.increment("graphql.authenticated.request");
      // bind the logged in user to the context overall
      try {
        if (context.authToken.indexOf("::") < 0) {
          context.authToken = `::${context.authToken}`;
        }

        context.user = await timeout(createdModels.User.getByBasicAuth(context.authToken), 5000);
        const person = await timeout(
          createdModels.User.getUserProfile(context.user.PersonId),
          5000
        );

        context.person = await timeout(
          createdModels.Person.getFromAliasId(person.PrimaryAliasId),
          5000
        );
      } catch (e) {
        /* tslint:disable-line */
      }
    }

    if (process.env.NODE_ENV === "production") {
      const sentry = new Raven.Client(process.env.SENTRY);
      context.sentry = sentry;
      if (context.person) {
        sentry.setUserContext({
          email: context.person.Email,
          id: context.person.PersonId
        });
      }
    }

    return {
      context: {
        ...context,
        ...{ models: createdModels }
      },
      tracing: process.env.NODE_ENV === "production",
      schema: executabledSchema,
      formatError: error => {
        if (process.env.NODE_ENV === "production") {
          if (datadog) datadog.increment("graphql.error");
          context.sentry.captureError(error, parsers.parseRequest(request));
        }
        return {
          message: error.message,
          locations: error.locations,
          stack: error.stack
        };
      }
    };
  };

  app.use("/graphql", apolloExpress(graphql));
}
