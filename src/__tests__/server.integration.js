// import express from "express";
// import { apolloExpress } from "apollo-server";
// import { tester } from "graphql-tester";
// import { create } from "graphql-tester/lib/main/servers/express";
// import bodyParser from "body-parser";
// import { createApp } from "../schema";

// let Heighliner;
// beforeEach(async () => {
//   const app = express();
//   const { graphql } = await createApp();

//   app.use(bodyParser.json());

//   app.use("/graphql", apolloExpress(graphql));

//   Heighliner = tester({
//     server: create(app),
//     url: "/graphql",
//     contentType: "application/json",
//   });
// });

xit("Valid queries should return success", () =>
  Heighliner(JSON.stringify({ query: "{ currentUser { id } }" })).then(
    response => {
      expect(response.success).toBeTruthy();
      expect(response.status).toEqual(200);
      expect(response.data).toBeTruthy();
    }
  ));

xit("Invalid queries should fail", () =>
  Heighliner(JSON.stringify({ query: "{ foobar { id } }" })).then(response => {
    expect(response.success).toBeFalsy;
    expect(response.status).toEqual(400);
    expect(response.errors).toBeTruthy();
  }));
