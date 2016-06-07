
import test from "ava";
import { Schema } from "mongoose";

import { MongoConnector, connect } from "../../lib/apollos/mongo";

test("\'connect\' should allow for a connection status to be returned", async t => {
  const status = await connect("fake address");
  t.false(status);
});

let testModel;
test.before(async t => {
  const connected = await connect("fake address");
  const schema = { _id: String };
  testModel = new MongoConnector("test", schema);
});


test("MongoConnector should expose the db connection", t => {
  t.truthy(testModel.db);
});

test("should create a pluralized collection based off the model name", t => {
  t.is(testModel.model.collection.collectionName, "tests");
});

test("should create a model based on the name passed", t => {
  t.is(testModel.model.modelName, "test");
});

test("should use the schema passed as the second argument", t => {
  const { schema } = testModel.model;

  t.true(schema instanceof Schema);
  t.truthy(schema.paths._id);
  t.is(schema.paths._id.instance, "String");
});

test("findOne should be a sugared passthrough to the models findOne", async t => {
  const oldFindOne = testModel.model.findOne;

  testModel.model.findOne = function mockedFindOne(...args) {
    t.is(args[0], "test")
    return new Promise((r) => r([1]));
  };

  const tests = await testModel.findOne("test");
  t.is(tests[0], 1)

  testModel.model.findOne = oldFindOne;

});
