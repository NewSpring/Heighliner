import { apolloServer } from "apollo-server";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import raven from "raven";
import Metrics from "datadog-metrics";

const dogstatsd = new Metrics.BufferedMetricsLogger({
  apiKey: process.env.DATADOG_API_KEY,
  appKey: process.env.DATADOG_APP_KEY,
  prefix: "heighliner.",
  flushIntervalSeconds: 15,
});

setInterval(() => {
  const memUsage = process.memoryUsage();
  dogstatsd.gauge("memory.rss", memUsage.rss);
  dogstatsd.gauge("memory.heapTotal", memUsage.heapTotal);
  dogstatsd.gauge("memory.heapUsed", memUsage.heapUsed);
}, 5000);

import { createApp } from "./schema";

async function start() {
  const app = express();

  // The request handler must be the first item
  app.use(raven.middleware.express.requestHandler(process.env.SENTRY));

  /*

    Middleware

  */
  // datadog
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
      dogstatsd.histogram("response_time", now, 1, statTags);
    };

    next();
  });

  app.get("/alive", (req, res) => {
    res.status(200).json({ alive: true });
  });

  const whitelist = [
    "http://localhost:3000",
    "http://localhost:12392",
    "https://alpha-app.newspring.io",
    "https://beta-native.newspring.cc",
    "https://beta-my.newspring.cc",
    "https://pre-my.newspring.cc",
    "https://my.newspring.cc",
    "https://newspring.cc",
    "https://newspringfuse.com",
    "https://newspringnetwork.com",
    "http://newspring.dev",
    "http://newspringfuse.dev",
    "http://newspringnetwork.dev",
  ];

  const corsOptions = {
    origin: (origin, callback) => {
      const originIsWhitelisted = whitelist.indexOf(origin) !== -1;
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

  app.post("/cache/flush", (req, res) => {
    cache.clearAll();
    res.end();
  });

  app.post("/cache", (req, res) => {
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

  app.use("/graphql", apolloServer(graphql));


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

  // The error handler must be before any other error middleware
  app.use(raven.middleware.express.errorHandler(process.env.SENTRY));

}

start();
