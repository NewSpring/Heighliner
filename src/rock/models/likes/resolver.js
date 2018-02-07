
const MutationReponseResolver = {
  error: ({ error }) => error,
  success: ({ success, error }) => success || !error,
  code: ({ code }) => code,
};

export default {
  Query: {
    recentlyLiked(_, { limit, skip, cache }, { models, user }) {
      const userId = user ? user._id : null;
      return models.Like.getRecentlyLiked({ limit, skip, cache }, userId, models.Node);
    },
  },
  Mutation: {
    toggleLike(_, { nodeId }, { models, person }) {
      if (!person) throw new Error("User is not logged in!");
      if (!nodeId) throw new Error("EntryId is missing!");
      return models.Like.toggleLike(nodeId, person.PrimaryAliasId, models.Node);
    },
  },
  LikesMutationResponse: {
    ...MutationReponseResolver,
    like: ({ like }) => like,
  },
};
