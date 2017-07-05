// import { flatten, difference } from "lodash";
// import sortBy from "lodash/sortBy";
// import StripTags from "striptags";
// import Truncate from "truncate";
// import { addResizings } from "./images";
import { createGlobalId } from "../../../util";

export default {
  Query: {
    rockContent(_, { channel, limit, skip, status, cache }, { models }) {
      const RContent = models.RockContent.find(channel);
      console.log(RContent);
      return RContent;
      // return models.RockContent.find(
      //   {
      //     channel_name: channel,
      //     offset: skip,
      //     limit,
      //   },
      //   cache,
      // );
    },
  },
  RockContent: {
    id: ({ Id }, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    channel: ({ Channel }) => Channel,
  },
  // RockContentData: {
  //   body: () => "body",
  //   description: () => "description",
  //   ooyalaId: () => "jdafsd",
  //   images: () => "hello images",
  // },
};
