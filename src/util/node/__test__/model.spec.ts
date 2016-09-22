
import casual from "casual";
import Node, { createGlobalId, parseGlobalId } from "../model";

it("`createGlobalId` should take two arguments and return a string", () => {
  const id = casual.word;
  const type = casual.word;

  expect(typeof createGlobalId(id, type)).toEqual("string");
});

it("`createGlobalId` should be decodeable by `parseGlobalId`", () => {
  const id = casual.word;
  const __type = casual.word;
  const globalId = createGlobalId(id, __type);

  expect(parseGlobalId(globalId)).toEqual({ __type, id });
});

it("`parseGlobalId` should take a global id and return the type and id", () => {
  const id = casual.word;
  const __type = casual.word;
  const globalId = createGlobalId(id, __type);

  expect(parseGlobalId(globalId)).toEqual({ __type, id });
});


it("Node class should parse an encoded id to get the type to resolve", async () => {
  const id = casual.word;
  const __type = "Test";
  const globalId = createGlobalId(id, __type);

  const context = {
    models: {
      Test: {
        getFromId(_id) {
          expect(_id).toEqual(id);
          return {};
        },
      },
    },
  };

  const node = new Node(context);
  node.get(globalId);

});

it("Node class should return data from the models `getFromId` method", async () => {
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
  const result = await node.get(globalId) as any;

  expect(result.test).toEqual(data.test);

});

it("Node class should attach the __type to the resulting data", async () => {
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
  const result = await node.get(globalId) as any;

  expect(result.__type).toEqual(__type);

});
