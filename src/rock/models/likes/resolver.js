
const MutationReponseResolver = {
  error: ({ error }) => error,
  success: ({ success, error }) => success || !error,
  code: ({ code }) => code,
};

export default {
  Query: {
    recentlyLiked(_, $, { models, user }) {
      models.Like.getRecentlyLiked(user._id, models.Node);
      // return null;
    }
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
  }
};
