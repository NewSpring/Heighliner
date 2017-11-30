import express from "express";
import { apolloExpress } from "apollo-server-express";
import { tester } from "graphql-tester";
import { create } from "graphql-tester/lib/main/servers/express";
import bodyParser from "body-parser";
import { createApp } from "../../../../schema";


let Heighliner;
beforeEach(async () => {
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

xit("Valid queries should return success", async () => {
  const response = await Heighliner(JSON.stringify({
    query: `
      query GetSearch {
        search(query: "hey", first: 1, after: 0, site: "example.com") {
          total
          next
          previous
          items {
            id
            title
            htmlTitle
            link
            displayLink
            description
            htmlDescription
            type
            section
            image
          }
        }
      }
    `,
  }));

  expect(response.success).toBeTruthy();
  expect(response.status).toEqual(200);
  expect(response.data).toBeTruthy();
});
