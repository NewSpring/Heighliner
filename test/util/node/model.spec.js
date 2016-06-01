
import { expect } from "chai";
import casual from "casual";
import Node, { createGlobalId, parseGlobalId } from "../../../lib/util/node/model";

describe("Node utilties", () => {

  describe("createGlobalId", () => {

    it("should take two arguments and return a string", () => {
      const id = casual.word;
      const type = casual.word;

      expect(createGlobalId(id, type)).to.be.a("string");
    });

    it("should be decodeable by `parseGlobalId`", () => {
      const id = casual.word;
      const __type = casual.word;
      const globalId = createGlobalId(id, __type);

      expect(parseGlobalId(globalId)).to.deep.equal({ __type, id });
    });

  });

  describe("parseGlobalId", () => {

    it("should take a global id and return the type and id", () => {
      const id = casual.word;
      const __type = casual.word;
      const globalId = createGlobalId(id, __type);

      expect(parseGlobalId(globalId)).to.deep.equal({ __type, id });
    });

  });

  describe("Node class", () => {

    it("should parse an encoded id to get the type to resolve", (done) => {
      const id = casual.word;
      const __type = "Test";
      const globalId = createGlobalId(id, __type);

      const context = {
        models: {
          Test: {
            getFromId(_id) {
              expect(_id).to.equal(id);
              done();
            },
          },
        },
      };

      const node = new Node(context);
      node.get(globalId);

    });

    it("should return data from the models `getFromId` method", (done) => {
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
      node.get(globalId)
        .then((result) => {
          expect(result.test).to.equal(data.test);
          done();
        });

    });

    it("should attach the __type to the resulting data", (done) => {
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
      node.get(globalId)
        .then((result) => {
          expect(result.__type).to.equal(__type);
          done();
        });

    });

  })

});
