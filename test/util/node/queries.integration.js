import { expect } from "chai";
import express from "express";
import { apolloServer } from "graphql-tools";
import { tester } from "graphql-tester";
import { create } from "graphql-tester/lib/main/servers/express";

import { createApp } from "../../../lib/schema";

// XXX figure out how to start and seed db on tests
describe("User queries", () => {
  const app = express();
  let Heighliner;

  before((done) => {

    createApp().then((endpoint) => {
      app.use("/graphql", apolloServer(endpoint));

      Heighliner = tester({
        server: create(app),
        url: "/graphql",
      });

      done();
    });

  });

  describe("node", function() {

    let response;
    beforeEach((done) => {
      Heighliner(`{
        node(id: "VXNlcjptdGhlMmhUQWhQU0dESEpuZQ=="){
          id
        }
      }`)
        .then((data) => {
          response = data;
          done();
        });
    });

    // it("it should return success", () => {
    //   expect(response.success).to.be.true;
    // });

    it("it should return the correct status code", () => {
      expect(response.status).to.equal(200);
    });

    // XXX figure out how to mock node resolver
    // it("it should return some data", () => {
    //   // expect(response.data.currentUser).to.exist;
    //   console.log(response)
    // });

  });

});
