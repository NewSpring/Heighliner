import { expect } from "chai";
import express from "express";
import { apolloServer } from "graphql-tools";
import { tester } from "graphql-tester";
import { create } from "graphql-tester/lib/main/servers/express";

import { createApp } from "../lib/schema";

describe("Using the application", () => {
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

  describe("Valid Query", function() {
    let response;
    beforeEach((done) => {
      Heighliner("{ currentUser { id } }")
        .then((data) => {
          response = data;
          done();
        });
    });

    it("it should return success", () => {
      expect(response.success).to.be.true;
    });

    it("it should return the correct status code", () => {
      expect(response.status).to.equal(200);
    });

    it("it should return some data", () => {
      expect(response.data.currentUser).to.exist;
    });

  });

  describe("Invalid Query", () => {
    let response;
    beforeEach((done) => {
      Heighliner("{ foobar { id } }")
        .then((data) => {
          response = data;
          done();
        });
    });

    it("it should return success", () => {
      expect(response.success).to.be.false;
    });

    it("it should return the correct status code", () => {
      expect(response.status).to.equal(400);
    });

    it("it should return some errors", () => {
      expect(response.errors).to.have.length.above(0);
    });

  });

});
