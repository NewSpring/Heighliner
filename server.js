
import express from 'express'
import graphqlHTTP from "express-graphql"
import { graphql } from 'graphql'

import Schema from './schemas'

let app  = express();
let PORT = 80;


app.use('/', graphqlHTTP({
  graphiql: true,
  pretty: true,
  schema: Schema,
}));


let server = app.listen(PORT, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('GraphQL listening at http://%s:%s', host, port);
});
