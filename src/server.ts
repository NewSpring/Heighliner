import { apolloServer } from "apollo-server";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
// import { pick } from "lodash";

import { createApp } from "./schema";

async function start() {
  const app = express();

  /*

    Middleware

  */
  app.get("/alive", (req, res) => {
    res.status(200).json({ alive: true });
  });

  const whitelist = [
    "http://localhost:3000",
    "http://localhost:12392",
    "https://alpha-app.newspring.io",
    "https://beta-app.newspring.io",
    "https://beta-my.newspring.cc",
    "https://my.newspring.cc",
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
  const { graphql, models, cache } = await createApp();

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
}

start();
