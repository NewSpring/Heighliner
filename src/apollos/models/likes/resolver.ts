import { LikeDocument } from "./model";
import { createGlobalId } from "../../../util";

export default {
  Query: {
    likes(_: any, args: any, { models, user }: any): any {
      if (!user) return [];
      return models.Like.getFromUserId(user._id);
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
