
import test from "ava";
import casual from "casual";
import Node, { createGlobalId, parseGlobalId } from "../../../lib/util/node/model";

test("`createGlobalId` should take two arguments and return a string", t => {
  const id = casual.word;
  const type = casual.word;

  t.is(typeof createGlobalId(id, type), "string");
});

test("`createGlobalId` should be decodeable by `parseGlobalId`", t => {
  const id = casual.word;
  const __type = casual.word;
  const globalId = createGlobalId(id, __type);

  t.deepEqual(parseGlobalId(globalId), { __type, id });
});

test("`parseGlobalId` should take a global id and return the type and id", t => {
  const id = casual.word;
  const __type = casual.word;
  const globalId = createGlobalId(id, __type);

  t.deepEqual(parseGlobalId(globalId), { __type, id });
});


test("Node class should parse an encoded id to get the type to resolve", async t => {
  const id = casual.word;
  const __type = "Test";
  const globalId = createGlobalId(id, __type);

  const context = {
    models: {
      Test: {
        getFromId(_id) {
          t.is(_id, id);
          t.pass();
          return {};
        },
      },
    },
  };

  const node = new Node(context);
  node.get(globalId);

});

test("Node class should return data from the models `getFromId` method", async t => {
  const id = casual.word;
  const __type = "Test";
  const globalId = createGlobalId(id, __type);
  const data = { test: casual.word };

  const context = {
    models: {
      Test: {
        getFromId(_id) {
          return Promise.resolve(data);
        },
      },
    },
  };

  const node = new Node(context);
  const result = await node.get(globalId);

  t.is(result.test, data.test);

});

test("Node class should attach the __type to the resulting data", async t => {
  const id = casual.word;
  const __type = "Test";
  const globalId = createGlobalId(id, __type);
  const data = { test: casual.word };

  const context = {
    models: {
      Test: {
        getFromId(_id) {
          return Promise.resolve(data);
        },
      },
    },
  };

  const node = new Node(context);
  const result = await node.get(globalId);

  t.is(result.__type, __type);

});
