
// import Resolver from "../resolver";
import { Like, safeTrimArray } from "../model";

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
  MongoConnector.prototype.distinct = jest.fn();
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

  describe("helper - safeTrimArray", () => {
    // safeTrimArray = (skip, limit, arr, emptyRet) => {}
    const testArr = [0,1,2,3,4,5];

    it("should return 4th arg with empty array passed in", () => {
      expect(safeTrimArray(1, 1, [], null)).toEqual(null);
      expect(safeTrimArray(1, 1, [], [])).toEqual([]);
    });
    it("should skip properly", () => {
      expect(safeTrimArray(1, 99, testArr, null)).toEqual([1,2,3,4,5]);
      expect(safeTrimArray(3, 99, testArr, null)).toEqual([3,4,5]);
      //test out of bounds skip
      expect(safeTrimArray(10, 99, testArr, null)).toEqual(null);
    });
    it("should limit properly", () => {
      expect(safeTrimArray(0, 99, testArr, null)).toEqual([0,1,2,3,4,5]);
      //zero length return relies on the 4th arg
      expect(safeTrimArray(0, 0, testArr, null)).toEqual(null);
      expect(safeTrimArray(0, 2, testArr, null)).toEqual([0,1]);
    });
  });

  describe("getRecentlyLiked", () => {

    it("should call createGlobalId properly", async () => {
      createGlobalId.mockReset();
      await like.getRecentlyLiked({limit: 1, skip: 2, cache: null}, "harambe", mockData.nodeModel);
      expect(createGlobalId).toBeCalledWith("1:2:harambe", "Like");
    });
    it("call distinct with proper query for no user", async () => {
      mongo.distinct.mockReturnValueOnce(null);
      defaultCache.get.mockImplementationOnce((a, b) => b());

      await like.getRecentlyLiked({limit: 1, skip: 2, cache: null}, null, mockData.nodeModel);
      expect(mongo.distinct).toBeCalledWith("entryId", { });
    });
    it("call distinct with proper query for user", async () => {
      mongo.distinct.mockReturnValueOnce(null);
      defaultCache.get.mockImplementationOnce((a, b) => b());

      await like.getRecentlyLiked({limit: 1, skip: 2, cache: null}, "harambe", mockData.nodeModel);
      expect(mongo.distinct).toBeCalledWith("entryId", { userId: { $ne: "harambe" } });
    });
    it("returns correct shape of data", async () => {
      mongo.distinct.mockReturnValueOnce(["123", "456"]);
      mockData.nodeModel.get.mockReturnValueOnce({entryId: "abc"});
      mockData.nodeModel.get.mockReturnValueOnce({entryId: "def"});
      defaultCache.get.mockImplementationOnce((a, b) => b());

      const res = await like.getRecentlyLiked({limit: 99, skip: 0, cache: null}, "harambe", mockData.nodeModel);
      expect(res).toEqual([{entryId: "abc"}, {entryId: "def"}]);
    });
    it("returns null if no results", async () => {
      mongo.distinct.mockReturnValueOnce(null);
      defaultCache.get.mockImplementationOnce((a, b) => b());

      const res = await like.getRecentlyLiked({limit: 99, skip: 0, cache: null}, "harambe", mockData.nodeModel);
      expect(res).toEqual(null);
    });
  });

});
