import test from "ava";
import express from "express";
import { apolloServer } from "apollo-server";
import { tester } from "graphql-tester";
import { create } from "graphql-tester/lib/main/servers/express";

import { createApp } from "../../../../src/schema";

let Heighliner;
test.before(async (t) => {
  const app = express();
  const { graphql } = await createApp();

  app.use("/graphql", apolloServer(graphql));

  Heighliner = tester({
    server: create(app),
    url: "/graphql",
  });
});

test("Valid queries should return sucess", async (t) => {
  const response = await Heighliner(`
    query UserLikes {
      likes {
        id
        userId
        entryId
        title
        image
        link
        icon
        category
        date
        status
        dateLiked
      }
    }
  `);

  t.true(response.success);
  t.is(response.status, 200);
  t.truthy(response.data);
});
