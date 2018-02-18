import casual from "casual";
import Resolver from "../resolver";

const sampleData = {
  _id: casual.word,
  __type: "Test",
};

it("Node should only have a __resolveType on the resolver", () => {
  const { Node } = Resolver;

  expect(Node.__resolveType).toBeTruthy();
  expect(Object.keys(Node).length).toEqual(1);
  expect(Object.keys(Node)[0]).toEqual("__resolveType");
});

it("Node should return the type from the data passed to it", () => {
  const { Node } = Resolver;

  const schema = {
    getType(type) {
      expect(type).toEqual(sampleData.__type);
      return type;
    },
  };

  const __type = Node.__resolveType(sampleData, null, { schema });
  expect(__type).toEqual(sampleData.__type);
});

it("Query node should return the data via the `Node` class", () => {
  const { Query } = Resolver;

  const fakeId = casual.word;
  const models = {
    Node: {
      get(id) {
        expect(id).toEqual(fakeId);
        return sampleData;
      },
    },
  };

  const data = Query.node(null, { id: fakeId }, { models });
  expect(data).toEqual(sampleData);
});
