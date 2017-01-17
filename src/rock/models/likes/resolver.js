
// import { flatten } from "lodash";

export default {
  Mutation: {
    toggleLike(_, { nodeId }, { models, user }) {
      // XXX what should the response be if invalid/insufficient data?
      if (!user || !nodeId) return [];
      return models.Like.toggleLike(nodeId, user._id, models.Node);
    },
  },
};
