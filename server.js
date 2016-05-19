import { apolloServer } from "graphql-tools";
import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";

import schema from "./schema";
import resolvers from "./resolvers";
import connectors from "./connectors";

import { Users } from "./apollos/users/connector"
const app = express();

/*

  Middleware

*/

app.get("/alive", (req, res) => {
  res.status(200).json({ alive: true });
})

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
  credentials: true
}

app.use(cors(corsOptions))

app.use(bodyParser.urlencoded({
  extended: true
}))

app.use(bodyParser.json())


/*

  Apollo Server

*/
app.use("/", apolloServer((request) => {
  return {
    graphiql: process.env.NODE_ENV != "production",
    pretty: true,
    context: {
      hashedToken: request.headers.authorization,
    },
    connectors,
    resolvers, // required if schema is an array of type definitions
    schema,
  };
}));


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
