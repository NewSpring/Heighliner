export default {
  Query: {
    likes(_: any, args: any, { models, user }: any): any {
      if (!user) return [];
      return models.Like.getLikedContent(user._id, models.Content);
    },
  },

  Mutation: {
    toggleLike(_: any, { contentId }, { models, user }: any): any {
      // XXX what should the response be if invalid/insufficient data?
      if (!user || !contentId) return [];
      return models.Like.toggleLike(contentId, user._id, models.Content);
    },
  },
};
