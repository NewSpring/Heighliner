import mongoose from "mongoose";

import { MongoConnector, connect } from "../mongo";

describe("connect", () => {
  it(
    "'connect' should allow for a connection status to be returned",
    async () => {
      const originalConnect = mongoose.connect;
      mongoose.connect = jest.fn((url, opts, cb) => cb(new Error()));
      const status = await connect();
      expect(status).toBeFalsy();
      mongoose.connect = originalConnect;
    },
  );
});

describe("MongoConnector", () => {
  let testModel;
  let originalConnect;
  beforeEach(async () => {
    if (testModel) return;
    originalConnect = mongoose.connect;
    mongoose.connect = jest.fn((url, opts, cb) => {
      cb(null);
      return {};
    });
    await connect();
    const schema = { _id: String };
    testModel = new MongoConnector("test", schema);
  });

  afterEach(() => {
    mongoose.connect = originalConnect;
  });

  it(" should expose the db connection", () => {
    expect(testModel.db).toBeTruthy();
  });

  it("should create a pluralized collection based off the model name", () => {
    expect(testModel.model.collection.collectionName).toEqual("tests");
  });

  it("should create a model based on the name passed", () => {
    expect(testModel.model.modelName).toEqual("test");
  });

  it("should use the schema passed as the second argument", () => {
    const { schema } = testModel.model;

    // expect(schema instanceof Schema).toBeTruthy();
    expect(schema.paths._id).toBeTruthy();
    expect(schema.paths._id.instance).toEqual("String");
  });

  it(
    "findOne should be a sugared passthrough to the models findOne",
    async () => {
      const oldFindOne = testModel.model.findOne;

      testModel.model.findOne = function mockedFindOne(...args) {
        expect(args[0]).toEqual("test");
        return new Promise(r => r([1]));
      };

      const tests = await testModel.findOne("test");
      expect(tests[0]).toEqual(1);

      testModel.model.findOne = oldFindOne;
    },
  );
});
