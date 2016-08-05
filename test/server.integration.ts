import test from "ava";
import express from "express";
import { apolloExpress } from "apollo-server";
import { tester } from "graphql-tester";
import { create } from "graphql-tester/lib/main/servers/express";
import bodyParser from "body-parser";
import { createApp } from "../src/schema";


let Heighliner;
test.before(async (t) => {
  const app = express();
  const { graphql } = await createApp();
  app.use(bodyParser.json());

  app.use("/graphql", apolloExpress(graphql));

  Heighliner = tester({
    server: create(app),
    url: "/graphql",
    contentType: "application/json",
  });

});


// test("Valid queries should return success", async (t) => {
//   const response = await Heighliner(JSON.stringify({ query: "{ currentUser { id } }" }));
//   t.true(response.success);
//   t.is(response.status, 200);
//   t.truthy(response.data);
// });

test("Invalid queries should fail", async (t) => {
  const response = await Heighliner(JSON.stringify({ query: "{ foobar { id } }" }));

  t.false(response.success);
  t.is(response.status, 400);
  t.truthy(response.errors);
});
