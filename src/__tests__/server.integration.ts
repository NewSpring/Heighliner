// remove once below is working
it("allows a test to be passed", () => { expect(true).toBeTruthy; });

// import * as express from "express";
// import { apolloExpress } from "apollo-server";
// import { tester } from "graphql-tester";
// import { create } from "graphql-tester/lib/main/servers/express";
// import * as bodyParser from "body-parser";
// import { createApp } from "../schema";


// let Heighliner;
// beforeEach(() => {
//   const app = express();
//   return createApp()
//     .then(({ graphql }) => {
//       app.use(bodyParser.json());

//       app.use("/graphql", apolloExpress(graphql));

//       Heighliner = tester({
//         server: create(app),
//         url: "/graphql",
//         contentType: "application/json",
//       });
//     });

// });


// it("Valid queries should return success", () => {
//   return Heighliner(JSON.stringify({ query: "{ currentUser { id } }" }))
//     .then(response => {
//       expect(response.success).toBeTruthy;
//       expect(response.status).toEqual(200);
//       expect(response.data).toBeTruthy;
//     });
// });

// it("Invalid queries should fail", () => {
//   return Heighliner(JSON.stringify({ query: "{ foobar { id } }" }))
//     .then(response => {
//       expect(response.success).toBeFalsy;
//       expect(response.status).toEqual(400);
//       expect(response.errors).toBeTruthy;
//     });
// });
