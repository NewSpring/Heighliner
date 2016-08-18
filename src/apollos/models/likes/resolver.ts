export default {
  Query: {
    likes(_: any, args: any, { models, user }: any): any {
      if (!user) return [];
      return models.Like.getLikedContent(user._id, models.Content);
    },
  },

  Mutation: {
    toggleLike(_: any, { nodeId }, { models, user }: any): any {
      // XXX what should the response be if invalid/insufficient data?
      if (!user || !nodeId) return [];
      return models.Like.toggleLike(nodeId, user._id, models.Content);
    },
  },
};
