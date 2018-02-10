import express from "express";

import util from "./routes/util";
import engine from "./routes/engine";
import graphiql from "./routes/graphiql";
import sentry, { errors } from "./routes/errors";
import setupDatadog from "./routes/datadog";
import createApp from "./routes/graphql";
import cacheUtils from "./routes/cache";

const app = express();

engine(app);
util(app);
graphiql(app);
sentry(app);
const datadog = setupDatadog(app);
cacheUtils(app, { datadog });
createApp(app, { datadog });
errors(app);

// Listen for incoming HTTP requests
const listener = app.listen(process.env.PORT || 80, () => {
  let host = listener.address().address;
  if (host === "::") host = "localhost";
  const port = listener.address().port;
  // eslint-disable-next-line
  console.log("Listening at http://%s%s", host, port === 80 ? "" : `:${port}`);
});

// this is only here for ooyala
listener.setTimeout(10 * 60 * 1000);
