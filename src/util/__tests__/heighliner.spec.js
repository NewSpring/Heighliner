import {
  createQueries,
  createMutations,
  // loadApplications, // XXX test this
  // createSchema, // XXX test this
} from "../heighliner";

xit("`createQueries` should return an array with `type Query`", () => {
  const queries = createQueries([]);
  expect(/type Query/.test(queries.join(" "))).toBeTruthy();
});

xit("`createQueries` should include the node interface", () => {
  const queries = createQueries([]);
  expect(/node\(id: ID!\): Node/.test(queries.join(" "))).toBeTruthy();
});

xit("`createQueries` should allow passing in new queries", () => {
  const queries = createQueries(["foo: Node"]);
  expect(/foo: Node/.test(queries.join(" "))).toBeTruthy();
});

xit("`createMutations` should return an array with `type Mutation`", () => {
  const mutations = createMutations([]);
  expect(/type Mutation/.test(mutations.join(" "))).toBeTruthy();
});

xit("`createMutations` should include the cache interface", () => {
  const mutations = createMutations([]);
  expect(
    /cache\(id: ID!, type: String\): Node/.test(mutations.join(" "))
  ).toBeTruthy();
});

xit("`createMutations` should allow passing in new mutations", () => {
  const mutations = createMutations(["foo(id: String): Node"]);
  expect(/foo\(id: String\): Node/.test(mutations.join(" "))).toBeTruthy();
});
