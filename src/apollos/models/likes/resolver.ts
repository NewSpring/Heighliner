import { LikeDocument } from "./model";
import { createGlobalId } from "../../../util";

export default {
  Query: {
    likes(_: any, args: any, { models, user }: any): any {
      if (!user) return [];
      return models.Like.getFromUserId(user._id);
    },
  },

  Mutation: {
    toggleLike(_: any, { contentId }, { models, user }: any): any {
      // XXX what should the response be if invalid/insufficient data?
      if (!user || !contentId) return [];
      return models.Like.toggleLike(contentId, user._id);
    },
  },

  Like: {
    id: ({ _id }: LikeDocument, _, $, { parentType }) => createGlobalId(_id, parentType.name),
    userId: ({ userId }) => userId,
    entryId: ({ entryId }) => entryId,
    title: ({ title }) => title,
    image: ({ image }) => image,
    link: ({ link }) => link,
    icon: ({ icon }) => icon,
    category: ({ category }) => category,
    date: ({ date }) => date,
    status: ({ status }) => status,
    dateLiked: ({ dateLiked }) => dateLiked,
  },
};
