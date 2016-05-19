
import express from "express"
// import graphqlHTTP from "express-graphql"
import { apolloServer, Tracer } from "graphql-tools"
import { graphql } from "graphql"
import Schema from "./schemas"
import bodyParser from "body-parser"
import forceSSL from "express-force-ssl"
import morgan from "morgan"
import cors from "cors"
import crypto from "crypto"
import { Users } from "./apollos"

// let PORT = process.env.DOCKER_HOST ? 80 : 8080
let PORT = process.env.PORT || 80

const app = express();


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
if (process.env.NODE_ENV === "production") {
  // force ssl
  // app.use(forceSSL)

  // initial simple auth using Rock creds
  app.use((req, res, next) => {
    if (req.method === "OPTIONS") {
      next();
    } else {
      let creds = auth(req)

      if (!creds || creds.name != "apollos" || creds.pass !=  process.env.ROCK_TOKEN) {
        res.statusCode = 401
        res.setHeader('WWW-Authenticate', 'Basic realm="example"')
        res.end('Access denied')
        return
      }

      next()
    }
  })
}




app.use(bodyParser.urlencoded({
  extended: true
}))

app.use(bodyParser.json())


app.use("/", apolloServer(() => {
  let user = null;

  if (request.headers.authorization) {
    let hashedToken = crypto.createHash('sha256');
    hashedToken.update(request.headers.authorization);
    hashedToken = hashedToken.digest('base64');

    // support hashed token or actual token
    user = await Users.findOne({
      $or: [
        { "services.resume.loginTokens.hashedToken": hashedToken },
        { "services.resume.loginTokens.hashedToken": request.headers.authorization },
      ],
    }, "_id, services.rock.PrimaryAliasId, services.rock.PersonId");
  }

  let graphql = {
    schema: Schema,
    graphiql: process.env.NODE_ENV != "production"
    context: {
      user,
    }
  };

  if (process.env.TRACER_APP_KEY) {
    const tracer = new Tracer({ TRACER_APP_KEY: process.env.TRACER_APP_KEY });
    graphql = {...graphql, ...{ tracer }};
  }

  return graphql;
}));


// Listen for incoming HTTP requests
const listener = app.listen(PORT, () => {
  var host = listener.address().address;
  if (host === "::") {
    host = "localhost";
  }
  var port = listener.address().port;
  console.log("Listening at http://%s%s", host, port === 80 ? "" : ":" + port);
});
