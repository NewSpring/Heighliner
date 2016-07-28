import test from "ava";
import Resolver from "../../../../src/apollos/models/likes/resolver";

test("`Query` should have the likes function", t => {
  const { Query } = Resolver;
  t.truthy(Query.likes);
});

test("`likes` should call getLikedContent with user id and content model", async (t) => {
  const user = {
    _id: "testId",
  };
  const models = {
    Like: {
      getLikedContent: (mockUser, mockModel) => {
        t.pass();
      },
    },
    Content: {},
  };
  const { Query } = Resolver;

  await Query.likes({}, {}, { models, user });
});

test("`Mutation` should have the toggleLike function", t => {
  const { Mutation } = Resolver;
  t.truthy(Mutation.toggleLike);
});

test("`toggleLike` should call toggleLike with params", async (t) => {
  const user = {
    _id: "testId",
  };
  const models = {
    Like: {
      toggleLike: (mockId, mockUser, mockModel) => {
        t.pass();
      },
    },
    Content: {},
  };
  const { Mutation } = Resolver;

  await Mutation.toggleLike({}, { contentId: "id" }, { models, user });
});
