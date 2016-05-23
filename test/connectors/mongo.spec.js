
import { expect } from "chai";
import { Schema } from "mongoose";

import { MongoConnector, connect } from "../../src/connectors/mongo";

describe("MongoDB", () => {

  describe("connecting to MongoDB", () => {

    it("should allow for a connection status to be returned", (done) => {

      connect("fake address")
        .then((status) => {
          expect(status).to.be.false;
          done();
        });

    });

  });

  describe("MongoConnector", () => {

    let testModel;
    before((done) => {

      connect("fake address")
        .then((status) => {
          const schema = { _id: String };
          testModel = new MongoConnector("test", schema);
          done();
        });

    });

    it("should expose the db connection", () => {
      expect(testModel.db).to.exist;
    });

    it("should create a pluralized collection based off the model name", () => {
      expect(testModel.model.collection.collectionName).to.equal("tests");
    });

    it("should create a model based on the name passed", () => {
      expect(testModel.model.modelName).to.equal("test");
    });

    it("should use the schema passed as the second argument", () => {
      const { schema } = testModel.model;

      expect(schema).to.be.instanceof(Schema);
      expect(schema.paths._id).to.exist;
      expect(schema.paths._id.instance).to.equal("String");
    });


    describe("findOne", () => {

      it("should be a sugared passthrough to the models findOne", () => {
        const oldFindOne = testModel.model.findOne;

        testModel.model.findOne = function mockedFindOne(...args) {
          expect(args[0][0]).to.equal("test");
          return [1];
        };

        const tests = testModel.findOne("test");
        expect(tests[0]).to.equal(1);

        testModel.model.findOne = oldFindOne;

      });

    });

  });

});

// export class MongoConnector {
//   constructor(collection, schema = {}) {
//     this.db = db;
//     this.model = mongoose.model(collection, new Schema(schema));
//
//     // this.loader =
//   }
//
//   findOne(...args) {
//     return this.model.findOne(args);
//   }
//
// }
