import test from "ava";
import express from "express";
import { apolloServer } from "apollo-server";
import { tester } from "graphql-tester";
import { create } from "graphql-tester/lib/main/servers/express";

import { createApp } from "../../../src/schema";

let Heighliner;
test.before(async (t) => {
  const app = express();
  const endpoint = await createApp();

  app.use("/graphql", apolloServer(endpoint));

  Heighliner = tester({
    server: create(app),
    url: "/graphql",
  });

});

// XXX figure out how to mock node resolver
test("Valid queries should return success", async (t) => {
  const response = await Heighliner(`{
    node(id: "VXNlcjptdGhlMmhUQWhQU0dESEpuZQ=="){
      id
    }
  }`);

  // t.true(response.success);
  t.is(response.status, 200);
});
