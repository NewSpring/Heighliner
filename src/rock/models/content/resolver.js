// import { flatten, difference } from "lodash";
// import sortBy from "lodash/sortBy";
// import StripTags from "striptags";
// import Truncate from "truncate";
// import { addResizings } from "./images";
import { createGlobalId } from "../../../util";

export default {
  Query: {
    rockContent: (_, { channel, limit, offset, cache }, { models }) =>
      models.RockContent.find(
        {
          channel,
          offset,
          limit,
        },
        cache,
      ),
  },
  RockContentChannel: {
    id: ({ Id }, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    name: ({ Name }) => Name,
    url: ({ ChannelUrl }) => ChannelUrl,
    typeId: ({ ContentChannelTypeId }) => ContentChannelTypeId,
    description: ({ Description }) => Description,
  },
  RockMeta: {
    date: ({ StartDateTime }) => StartDateTime,
  },
  RockContent: {
    id: ({ Id }, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    entityId: ({ Id }) => Id,
    content: ({ Content }) => Content,
    title: ({ Title }) => Title,
    entrydate: ({ StartDateTime }) => StartDateTime,
    image: ({ Id }, _, { models }) => models.RockContent.getAttributeFromId("Image", Id),
    summary: ({ Id }, _, { models }) => models.RockContent.getAttributeFromId("Summary", Id),
    ooyalaId: ({ Id }, _, { models }) => models.RockContent.getAttributeFromId("Video ID", Id),
    audioUrl: ({ Id }, _, { models }) => models.RockContent.getAttributeFromId("Audio URL", Id),
    channel: ({ ContentChannel }) => ContentChannel,
    channelName: ({ ContentChannel }) => ContentChannel.Name,
    meta: data => data,
  },
};
