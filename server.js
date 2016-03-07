
import express from "express"
import graphqlHTTP from "express-graphql"
import { graphql } from "graphql"
import Schema from "./schemas"
import bodyParser from "body-parser"
import forceSSL from "express-force-ssl"
import morgan from "morgan"
import auth from "basic-auth"

// let PORT = process.env.DOCKER_HOST ? 80 : 8080
let PORT = process.env.PORT || 80

const app = express();


if (process.env.NODE_ENV === "production") {
  // force ssl
  app.use(forceSSL)

  // initial simple auth using Rock creds
  app.use((req, res, next) => {
    let creds = auth(req)

    if (!creds || creds.name != "apollos" || creds.pass !=  process.env.ROCK_TOKEN) {
      res.statusCode = 401
      res.setHeader('WWW-Authenticate', 'Basic realm="example"')
      res.end('Access denied')
      return
    }

    next()
  })
}


app.use(morgan("combined"))

app.use(bodyParser.urlencoded({
  extended: true
}))

app.use(bodyParser.json())





// Add headers
app.use((req, res, next) => {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();

});

app.get("/alive", (req, res) => {
  res.status(200).json({ alive: true });
})


app.use("/", graphqlHTTP(() => ({
  schema: Schema,
  graphiql: process.env.NODE_ENV != "production"
})));


// Listen for incoming HTTP requests
const listener = app.listen(PORT, () => {
  var host = listener.address().address;
  if (host === "::") {
    host = "localhost";
  }
  var port = listener.address().port;
  console.log("Listening at http://%s%s", host, port === 80 ? "" : ":" + port);
});
