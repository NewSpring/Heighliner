
import test from "ava";
import { createGlobalId, parseGlobalId } from "../../../src/util/node/model";
import Mocks from "../../../src/util/node/mocks";

test("Node should dynamically resolve the type", t => {
  const { Node } = Mocks;

  const { __resolveType } = Node();
  const __type = "Test";

  const schema = {
    getType(type) {
      t.is(__type, "Test");
      return type;
    },
  };
  const type = __resolveType({ __type }, null, { schema });

  t.is(type, __type);
});

test("Query should expose node as part of the query", t => {
  const { Query } = Mocks;

  const { node } = Query;

  t.truthy(node);
  t.is(typeof node, "function");

});

test("Node query should return a parsed global id", t => {
  const { Query } = Mocks;
  const id = createGlobalId("test", "Test");
  const { node } = Query;

  const parsed = node(null, { id });
  t.deepEqual(parsed, parseGlobalId(id));

});
