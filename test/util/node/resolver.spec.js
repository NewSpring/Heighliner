
import test from "ava";
import casual from "casual";
import Resolver from "../../../lib/util/node/resolver";

const sampleData = {
  _id: casual.word,
  __type: "Test",
};

test("Node should only have a __resolveType on the resolver", t => {
  const { Node } = Resolver;

  t.truthy(Node.__resolveType);
  t.is(Object.keys(Node).length, 1);
  t.is(Object.keys(Node)[0], "__resolveType");

});

test("Node should return the type from the data passed to it", t => {
  const { Node } = Resolver;

  const schema = {
    getType(type){
      t.is(type, sampleData.__type);
      return type;
    },
  };

  const __type = Node.__resolveType(sampleData, null, { schema });
  t.is(__type, sampleData.__type);
});

test("Query node should return the data via the `Node` class", t => {
  const { Query } = Resolver;

  const fakeId = casual.word;
  const models = {
    Node: {
      get(id){
        t.is(id, fakeId);
        return sampleData;
      },
    },
  };

  const data = Query.node(null, { id: fakeId }, { models });
  t.deepEqual(data, sampleData);

});
