// import express from "express";
// import { apolloExpress } from "apollo-server";
// import { tester } from "graphql-tester";
// import { create } from "graphql-tester/lib/main/servers/express";
// import bodyParser from "body-parser";
// import { createApp } from "../../../schema";


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


xit("Valid queries should return success", async () => {
  const response = await Heighliner(JSON.stringify({
    query: `
      mutation ClearCache {
        cache(id:"VXNlcjpyWE5iRXlIWmhycENUdHpOZw=="){
          id
        }
      }
    `,
  }));

  expect(response.success).toBeTruthy();
  expect(response.status).toEqual(200);
});
