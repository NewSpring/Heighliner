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
  likes.model.find = function mockedFind(mongoQuery) {
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
  likes.getFromUserId = function mockedFunction(mockUserId) {
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
  likes.getFromUserId = function mockedFunction(mockUserId) {
    return Promise.resolve([
      { _id: "1", entryId: "1", type: "Test" } as LikeDocument,
      { _id: "1", entryId: "2", type: "Test" } as LikeDocument,
    ] as LikeDocument[]);
  };

  await likes.getLikedContent(userId, contentModel);
});

test("`toggleLike` should return null if not content type", async (t) => {
  const contentId = "testId";
  const globalId = createGlobalId(contentId, "NotContent");
  const userId = "userId";
  const contentModel = {};

  const likes = new Like();

  const toggle = await likes.toggleLike(globalId, userId, contentModel);
  t.falsy(toggle);
});

test("`toggleLike` should look up existing like", async (t) => {
  const contentId = "testId";
  const globalId = createGlobalId(contentId, "Content");
  const userId = "userId";
  const contentModel = {};

  const likes = new Like();

  likes.model.findOne = (options) => {
    t.is(options.entryId, contentId);
    t.is(options.userId, userId);
    return Promise.resolve([]);
  };

  await likes.toggleLike(globalId, userId, contentModel);
});

test("`toggleLike` should create a like if no existing like", async (t) => {
  const contentId = "testId";
  const globalId = createGlobalId(contentId, "Content");
  const userId = "userId";
  const contentModel = {};

  const likes = new Like();

  likes.model.create = (options) => {
    t.is(options.userId, userId);
    t.is(options.entryId, contentId);
    t.is(options.type, "Content");
    t.truthy(options.createdAt);
    return Promise.resolve([]);
  };

  await likes.toggleLike(globalId, userId, contentModel);
});

// test.todo("`toggleLike` should delete a like if one exists", async (t) => {

// });
