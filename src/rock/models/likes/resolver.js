const MutationReponseResolver = {
  error: ({ error }) => error,
  success: ({ success, error }) => success || !error,
  code: ({ code }) => code,
};

export default {
  Query: {
    recentlyLiked(_, { limit, skip, cache }, { models, user }) {
      const userId = user ? user._id : null;
      return models.Like.getRecentlyLiked(
        { limit, skip, cache },
        userId,
        models.Node,
      );
    },
  },
  Mutation: {
    toggleLike(_, { nodeId }, { models, user }) {
      // XXX what should the response be if invalid/insufficient data?
      if (!user || !nodeId) return [];
      return models.Like.toggleLike(nodeId, user._id, models.Node);
    },
  },
  LikesMutationResponse: {
    ...MutationReponseResolver,
    like: ({ like }) => like,
  },
};
