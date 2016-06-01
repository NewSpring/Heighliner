import { expect } from "chai";
import casual from "casual";

import {
  createQueries,
  createMutations,
  loadApplications,
  createSchema,
} from "../../lib/util/heighliner";

describe("Application helpers", () => {

  describe("createQueries", () => {
    it("should return an array with `type Query`", () => {
      const queries = createQueries([]);
      expect(queries).to.match(/type Query/);
    });

    it("should include the node interface", () => {
      const queries = createQueries([]);
      expect(queries).to.match(/node\(id: ID!\): Node/);
    });

    it("should allow passing in new queries", () => {
      const queries = createQueries([`foo: Node`]);
      expect(queries).to.match(/foo: Node/);
    });
  });

  describe("createMutations", () => {
    it("should return an array with `type Mutation`", () => {
      const mutations = createMutations([]);
      expect(mutations).to.match(/type Mutation/);
    });

    it("should include the cache interface", () => {
      const mutations = createMutations([]);
      expect(mutations).to.match(/cache\(id: ID!\): Node/);
    });

    it("should allow passing in new mutations", () => {
      const mutations = createMutations([`foo(id: String): Node`]);
      expect(mutations).to.match(/foo\(id: String\): Node/);
    });
  });

});
