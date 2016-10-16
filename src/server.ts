import { apolloExpress } from "apollo-server";
import { graphiqlExpress } from "apollo-server";
import OpticsAgent from "optics-agent";

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import raven from "raven";
import Metrics from "datadog-metrics";

let dogstatsd;
if (process.env.DATADOG_API_KEY && process.env.NODE_ENV === "production") {
  dogstatsd = new Metrics.BufferedMetricsLogger({
    apiKey: process.env.DATADOG_API_KEY,
    appKey: process.env.DATADOG_APP_KEY,
    prefix: `heighliner.${process.env.SENTRY_ENVIRONMENT}.`,
    flushIntervalSeconds: 15,
  });

  setInterval(() => {
    const memUsage = process.memoryUsage();
    dogstatsd.gauge("memory.rss", memUsage.rss);
    dogstatsd.gauge("memory.heapTotal", memUsage.heapTotal);
    dogstatsd.gauge("memory.heapUsed", memUsage.heapUsed);
  }, 5000);
}

import { createApp } from "./schema";

async function start() {
  const app = express();

  if (process.env.NODE_ENV === "production") {
    // The request handler must be the first item
    app.use(raven.middleware.express.requestHandler(process.env.SENTRY));
  }
  /*

    Middleware

  */
  // datadog
  if (dogstatsd) {
    app.use((req: any, res, next) => {
      if (!req._startTime) req._startTime = new Date();
      const end = res.end;
      res.end = (chunk, encoding) => {
        res.end = end;
        res.end(chunk, encoding);
        const baseUrl = req.baseUrl;
        const statTags = [ "route:" + baseUrl + req.path ];

        statTags.push("method:" + req.method.toLowerCase());
        statTags.push("protocol:" + req.protocol);
        statTags.push("path:" + baseUrl + req.path);
        statTags.push("response_code:" + res.statusCode);

        dogstatsd.increment("response_code." + res.statusCode , 1, statTags);
        dogstatsd.increment("response_code.all" , 1, statTags);

        let now = (new Date() as any) - req._startTime;
        dogstatsd.histogram("response_time", now, statTags);
      };

      next();
    });
  }

  app.get("/alive", (req, res) => {
    res.status(200).json({ alive: true });
  });

  app.get("/graphql/ping", (req, res) => {
    res.status(200).end();
  });

  const sites = /^http(s?):\/\/.*.?(newspring|newspringfuse|newspringnetwork).(com|cc|io|dev)$/;
  const local = /^http(s?):\/\/localhost:\d*$/;

  const corsOptions = {
    origin: (origin, callback) => {
      const originIsWhitelisted = sites.test(origin) || local.test(origin);
      callback(null, originIsWhitelisted);
    },
    credentials: true,
  };

  app.use(cors(corsOptions));

  app.use(bodyParser.urlencoded({
    extended: true,
  }));

  app.use(bodyParser.json());

  /*

    Apollo Server

  */
  const { graphql, models, cache } = await createApp({ datadog: dogstatsd });

  app.post("/graphql/cache/flush", (req, res) => {
    cache.clearAll();
    res.end();
  });

  app.post("/graphql/cache", (req, res) => {
    const { type, id } = req.body;
    if (!type || !id ) {
      res.status(500).send({ error: "Missing `id` or `type` for request" });
      return;
    }
    let clearingCache;
    for (let model in models) {
      const Model = models[model] as any;
      if (!Model.cacheTypes) continue;
      if (Model.cacheTypes.indexOf(type) === -1) continue;
      clearingCache = true;
      // XXX should we hold off the res until this responds?
      Model.clearCacheFromRequest(req);
    }
    if (!clearingCache) {
      res.status(404).send({ error: `No model found for ${type}` });
      return;
    }

    res.status(200).send({ message: `Cache cleared for ${type} ${id}`});
  });

  if (process.env.SENTRY_ENVIRONMENT !== "production") {
    app.use("/view", graphiqlExpress({ endpointURL: "/graphql" }));
    app.use("/graphql/view", graphiqlExpress({ endpointURL: "/graphql" }));
  }


  if (process.env.OPTICS_API_KEY) app.use("/graphql", OpticsAgent.middleware());
  app.use("/graphql", apolloExpress(graphql));

  // The error handler must be before any other error middleware
  if (process.env.NODE_ENV === "production") {
    app.use(raven.middleware.express.errorHandler(process.env.SENTRY));
  }

  let PORT = process.env.PORT || 80;
  // Listen for incoming HTTP requests
  const listener = app.listen(PORT, () => {
    let host = listener.address().address;
    if (host === "::") {
      host = "localhost";
    }
    const port = listener.address().port;
    console.log( // tslint:disable-line
      "Listening at http://%s%s", host, port === 80 ? "" : ":" + port
    );
  });

}

start();
