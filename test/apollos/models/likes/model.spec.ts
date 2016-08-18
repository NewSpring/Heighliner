import test from "ava";
import { Like, LikeDocument } from "../../../../src/apollos/models/likes/model";
import { createGlobalId } from "../../../../src/util/node/model";

test("should expose the model", t => {
  const likes = new Like() as any;
  t.truthy(likes.model);
});

test("should expose the cache", t => {
  const likes = new Like() as any;
  t.truthy(likes.cache);
});

test("should expose the type", t => {
  const likes = new Like() as any;
  t.is(likes.__type, "Like");
});

test("`getFromUserId` should pass the userId along to the model find", async (t) => {
  const userId = "testId";
  const result = {
    userId,
  };
  const likes = new Like();

  const oldFind = likes.model.find;
  likes.model.find = function mockedFind(mongoQuery) {
    likes.model.find = oldFind;
    t.deepEqual(result, mongoQuery);
    return Promise.resolve({});
  };

  await likes.getFromUserId(userId);
});

test("`getFromUserId` should try and read data from the cache", async (t) => {
  const userId = "testId";
  const testKey = `Like:${userId}`;

  const cache = {
    get(key) {
      t.is(testKey, key);
      t.pass();
      return Promise.resolve();
    },
  };

  const tempLikes = new Like({ cache });

  await tempLikes.getFromUserId(userId);
});

test("`getLikedContent` should call getFromUserId", async (t) => {
  const userId = "testId";

  const likes = new Like();
  const oldGetFromUserId = likes.getFromUserId;
  likes.getFromUserId = function mockedFunction(mockUserId) {
    likes.getFromUserId = oldGetFromUserId;
    t.is(userId, mockUserId);
    return Promise.resolve([]);
  };

  await likes.getLikedContent(userId, {});
});

test("`getLikedContent` should use contentModel", async (t) => {
  const userId = "testId";
  const contentModel = {
    getFromId: () => {
      t.pass();
      return Promise.resolve([]);
    },
  };

  const likes = new Like();
  const oldGetFromUserId = likes.getFromUserId;
  likes.getFromUserId = function mockedFunction(mockUserId) {
    likes.getFromUserId = oldGetFromUserId;
    return Promise.resolve([
      { _id: "1", entryId: "1", type: "Test" } as LikeDocument,
      { _id: "2", entryId: "2", type: "Test" } as LikeDocument,
    ] as LikeDocument[]);
  };

  await likes.getLikedContent(userId, contentModel);
});

test("`toggleLike` should return null if not content type", async (t) => {
  const nodeId = "testId";
  const globalId = createGlobalId(nodeId, "NotContent");
  const userId = "userId";
  const contentModel = {};

  const likes = new Like();

  const toggle = await likes.toggleLike(globalId, userId, contentModel);
  t.falsy(toggle);
});

test("`toggleLike` should look up existing like", t => {
  const nodeId = "testId";
  const globalId = createGlobalId(nodeId, "Content");
  const userId = "userId";
  const contentModel = {};

  const likes = new Like();

  const oldFindOne = likes.model.findOne;
  likes.model.findOne = (options) => {
    likes.model.findOne = oldFindOne;
    t.is(options.entryId, nodeId);
    t.is(options.userId, userId);
    return Promise.resolve([]);
  };

  likes.toggleLike(globalId, userId, contentModel);
});

test("`toggleLike` should create a like if no existing like", t => {
  const nodeId = "testId";
  const globalId = createGlobalId(nodeId, "Content");
  const userId = "userId";
  const contentModel = {};

  const likes = new Like();

  const oldCreate = likes.model.create;
  likes.model.create = (options) => {
    likes.model.create = oldCreate;
    t.is(options.userId, userId);
    t.is(options.entryId, nodeId);
    t.is(options.type, "Content");
    t.truthy(options.createdAt);
    return Promise.resolve([]);
  };

  likes.toggleLike(globalId, userId, contentModel);
});

test("`toggleLike` should delete a like if one exists", t => {
  const nodeId = "testId";
  const globalId = createGlobalId(nodeId, "Content");
  const userId = "userId";
  const contentModel = {};
  const sampleLike = {
    _id: "id",
    userId: "userId",
    entryId: "entryId",
    type: "Content",
    createdAt: new Date(),
  };

  const likes = new Like();

  const oldFindOne = likes.model.findOne;
  likes.model.findOne = (options) => {
    likes.model.findOne = oldFindOne;
    return Promise.resolve(sampleLike);
  };

  likes.model.remove = (options) => {
    t.is(options._id, sampleLike._id);
    return Promise.resolve(sampleLike);
  };

  likes.toggleLike(globalId, userId, contentModel);
});
