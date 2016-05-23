import { apolloServer } from "graphql-tools";
import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";

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
  const endpoint = await createApp();
  app.use("/", apolloServer(endpoint));


  let PORT = process.env.PORT || 80;
  // Listen for incoming HTTP requests
  const listener = app.listen(PORT, () => {
    var host = listener.address().address;
    if (host === "::") {
      host = "localhost";
    }
    var port = listener.address().port;
    console.log("Listening at http://%s%s", host, port === 80 ? "" : ":" + port);
  });
}

start();
