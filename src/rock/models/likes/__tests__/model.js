
// import Resolver from "../resolver";
import { Like } from "../model";

import uuid from "node-uuid";
import { Cache, defaultCache } from "../../../../util/cache";
import { MongoConnector } from "../../../../apollos/mongo";
import { createGlobalId } from "../../../../util/node/model";

jest.mock("node-uuid", () => ({
  v4: jest.fn(() => "12345"),
}));

jest.mock("../../../../apollos/mongo", () => {
  function MongoConnector(name, schema) {}
  MongoConnector.prototype.find = jest.fn();
  MongoConnector.prototype.remove = jest.fn();
  MongoConnector.prototype.create = jest.fn();
  MongoConnector.prototype.findOne = jest.fn();
  return { MongoConnector };
});

jest.mock("../../../../util/cache", () => ({
  defaultCache: {
    get: jest.fn(),
    del: jest.fn()
  }
}));

jest.mock("../../../../util/node/model", () => ({
  createGlobalId: jest.fn(() => "12341234")
}));

const mockData = {
  nodeModel: {
    get: jest.fn(),
  },
};

describe("Like", () => {
  let like;
  let cache;
  const mongo = MongoConnector.prototype;

  beforeEach(() => {
    like = new Like();
    cache = defaultCache;
  });

  afterEach(() => {
    like = null;
    mongo.find.mockReset();
    mongo.remove.mockReset();
    mongo.create.mockReset();
    mongo.findOne.mockReset();
  })

  describe("getFromUserId", () => {
    it("should generage global id", () => {
      like.getFromUserId("1234");
      expect(createGlobalId).toBeCalledWith("1234");
    });
    it("should do a cache lookup", () => {
      like.getFromUserId("1234");
      expect(cache.get).toBeCalled();
      expect(cache.get.mock.calls[1][0]).toEqual("12341234");
    });
    it("should do a mongo find on cache miss", () => {
      defaultCache.get.mockImplementationOnce((a, b) => b());
      like.getFromUserId("1234");
      expect(mongo.find).toBeCalledWith({ userId: "1234" });
    });
  });

  describe("getLikedContent", () => {
    beforeEach(() => {
      like.getFromUserId = jest.fn(() => [{entryId: "harambe"}]);
    });
    it("should call getFromUserId", async () => {
      await like.getLikedContent("1234", mockData.nodeModel);
      expect(like.getFromUserId).toBeCalledWith("1234");
      mockData.nodeModel.get.mockReset();
    });
    it("should call get on node model with entry ids", async () => {
      await like.getLikedContent("1234", mockData.nodeModel);
      expect(mockData.nodeModel.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("toggleLike", () => {
    beforeEach(() => {
      like.getLikedContent = jest.fn();
    });

    it("should lookup existing like", () => {
      //default state: no current like
      mongo.findOne.mockReturnValueOnce(null);

      like.toggleLike("abcde", "1234", mockData.nodeModel);
      expect(mongo.findOne).toBeCalledWith({ "entryId": "abcde", "userId": "1234" });
    });
    it("should remove current like", async () => {
      // mongo needs to find an existing like
      mongo.findOne.mockReturnValueOnce({_id: "harambe"});

      await like.toggleLike("abcde", "1234", mockData.nodeModel);
      expect(mongo.remove).toBeCalledWith({ _id: "harambe" });
    });
    it("should create a like if one isn't found", async () => {
      //default state: no current like
      mongo.findOne.mockReturnValueOnce(null);
      Date = jest.fn();

      await like.toggleLike("abcde", "1234", mockData.nodeModel);
      expect(mongo.create).toBeCalledWith({
        _id: "12345",
        createdAt: {},
        entryId: "abcde",
        userId: "1234",
      });
    });
    it("deletes cache", async () => {
      createGlobalId.mockReset();
      createGlobalId.mockReturnValue("123456789");
      cache.del.mockReset();

      await like.toggleLike("abcde", "1234", mockData.nodeModel);

      expect(createGlobalId).toBeCalledWith("1234");
      expect(cache.del).toBeCalledWith("123456789");
    });
    it("returns mutation response", async () => {
      like.getLikedContent.mockReturnValueOnce([{}, {}]);
      mockData.nodeModel.get.mockReturnValueOnce("like: {...}");
      const likes = await like.toggleLike("abcde", "1234", mockData.nodeModel);

      expect(likes.code).toBeDefined()
      expect(likes.error).toBeDefined();
      expect(likes.like).toEqual("like: {...}");
      expect(likes.success).toBeDefined()
    });
  });

});
