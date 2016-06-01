
import { expect } from "chai";
import casual from "casual";
import Resolver from "../../../lib/util/node/resolver";

describe("Node resolvers", () => {

  const sampleData = {
    _id: casual.word,
    __type: "Test",
  };

  describe("Node", () => {

    it("should only have a __resolveType on the resolver", () => {
      const { Node } = Resolver;

      expect(Node.__resolveType).to.exist;
      expect(Object.keys(Node).length).to.equal(1);
      expect(Object.keys(Node)[0]).to.equal("__resolveType");

    });

    it("should return the type from the data passed to it", () => {
      const { Node } = Resolver;

      const schema = {
        getType(type){
          expect(type).to.equal(sampleData.__type);
          return type;
        },
      };

      const __type = Node.__resolveType(sampleData, null, { schema });
      expect(__type).to.equal(sampleData.__type);
    });

  });

  describe("Query", () => {

    describe("node", () => {

      it("should return the data via the `Node` class", () => {
        const { Query } = Resolver;

        const fakeId = casual.word;
        const models = {
          Node: {
            get(id){
              expect(id).to.equal(fakeId);
              return sampleData;
            },
          },
        };

        const data = Query.node(null, { id: fakeId }, { models });
        expect(data).to.deep.equal(sampleData);

      });

    });

  });

});
