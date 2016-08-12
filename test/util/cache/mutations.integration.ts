import test from "ava";
import express from "express";
import { apolloExpress } from "apollo-server";
import { tester } from "graphql-tester";
import { create } from "graphql-tester/lib/main/servers/express";
import bodyParser from "body-parser";

import { createApp } from "../../../src/schema";

let Heighliner;
test.before(async (t) => {
  const app = express();
  const { graphql } = await createApp();
  app.use(bodyParser.urlencoded({
    extended: true,
  }));
  app.use(bodyParser.json());
  app.use("/graphql", apolloExpress(graphql));

  Heighliner = tester({
    server: create(app),
    url: "/graphql",
    contentType: "application/json",
  });

});


test.skip("Valid queries should return success", async (t) => {
  const response = await Heighliner(JSON.stringify({
    query: `
      mutation ClearCache {
        cache(id:"VXNlcjpyWE5iRXlIWmhycENUdHpOZw=="){
          id
        }
      }
    `,
  }));

  t.true(response.success);
  t.is(response.status, 200);

});
