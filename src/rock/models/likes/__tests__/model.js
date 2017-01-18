
// import Resolver from "../resolver";
import { Like } from "../model";

import uuid from "node-uuid";
import { Cache, defaultCache } from "../../../../util/cache";
import { MongoConnector } from "../../../../apollos/mongo";
import { createGlobalId } from "../../../../util/node/model";

jest.mock("node-uuid", () => ({
  uuid: {
    v4: () => "1234567"
  }
}));

jest.mock("../../../../apollos/mongo", () => {

  function MongoConnector(name, schema) {

  }

  MongoConnector.prototype.find = jest.fn();
  MongoConnector.prototype.remove = jest.fn();
  MongoConnector.prototype.create = jest.fn();

  return {MongoConnector};
});
  // MongoConnector: jest.fn(() => ({
  //   find: () => jest.fn(),
  //   remove: () => "123",
  //   create: () => "123",
  // }))
  // MongoConnector: ({
  //   find: () => jest.fn(),
  //   remove: () => "123",
  //   create: () => "123",
  // })
// }));

jest.mock("../../../../util/cache", () => ({
  defaultCache: {
    get: jest.fn(() => "123"),
    del: jest.fn(() => "123")
  }
}));

jest.mock("../../../../util/node/model", () => ({
  createGlobalId: jest.fn(() => "12341234")
}));

describe("Like", () => {
  let like;

  beforeEach(() => {
    like = new Like();
  });

  afterEach(() => {
    like = null;
  })

  describe("getFromUserId", () => {
    it("should generage global id", () => {
      like.getFromUserId("1234");
      expect(createGlobalId).toBeCalledWith("1234");
    });
    it("should do a cache lookup", () => {
      like.getFromUserId("1234");
      expect(defaultCache.get.mock.calls[1][0]).toEqual("12341234");
    });
    it("should do a mongo find on cache miss", () => {
      defaultCache.get.mockImplementationOnce((a, b) => b());
      like.getFromUserId("1234");
      console.log(MongoConnector().find());
      expect(MongoConnector().find()).toBeCalled();
    });
  });

});
