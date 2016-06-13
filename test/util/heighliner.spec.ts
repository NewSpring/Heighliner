import test from "ava";

import {
  createQueries,
  createMutations,
  // loadApplications, // XXX test this
  // createSchema, // XXX test this
} from "../../src/util/heighliner";

test("`createQueries` should return an array with `type Query`", t => {
  const queries = createQueries([]);
  t.true(/type Query/.test(queries.join(" ")));
});

test("`createQueries` should include the node interface", t => {
  const queries = createQueries([]);
  t.true(/node\(id: ID!\): Node/.test(queries.join(" ")));
});

test("`createQueries` should allow passing in new queries", t => {
  const queries = createQueries([`foo: Node`]);
  t.true(/foo: Node/.test(queries.join(" ")));
});

test("`createMutations` should return an array with `type Mutation`", t => {
  const mutations = createMutations([]);
  t.true(/type Mutation/.test(mutations.join(" ")));
});

test("`createMutations` should include the cache interface", t => {
  const mutations = createMutations([]);
  t.true(/cache\(id: ID!, type: String\): Node/.test(mutations.join(" ")));
});

test("`createMutations` should allow passing in new mutations", t => {
  const mutations = createMutations([`foo(id: String): Node`]);
  t.true(/foo\(id: String\): Node/.test(mutations.join(" ")));
});
