import test from "ava";
import { Like } from "../../../../src/apollos/models/likes/model";

test("should expose the model", t => {
  const likes = new Like() as any;
  t.truthy(likes.model);
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
