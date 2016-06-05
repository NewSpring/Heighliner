
import { createGlobalId } from "../../util";

export default {

  ContentTrack: {
    // id: ID!
    file: () => 'foobar',
    duration: () => null,
    title: () => null,
  },

  ContentColor: {
    // id: ID!
    id: () => "foo",
    value: () => "foo",
    description: () => "foo",
  },

  ContentData: {
    body: ({ editorial_body }, _, { models }) => models.Content.cleanMarkup(editorial_body),
    description: () => "foo",
    scripture: () => "foo",
    ooyalaId: ({ editorial_ooyalaId }) => editorial_ooyalaId,
    tags: ({ editorial_tags }, _, { models }) => models.Content.splitByNewLines(editorial_tags),
    speakers: () => ["foo"],
    isLight: () => true,

    images: ({ entry_id }, _, { models }) => {
      // XXX how do we do this dynamically based on the channel?
      return models.File.getFilesFromContent(entry_id, "Hero Image", "collection_images");
    },
    colors: data => [],
  },

  ContentMeta: {
    urlTitle: ({ exp_channel_title }) => exp_channel_title.url_title,
    site: ({ site_id }) => createGlobalId(site_id, "Sites"),
    channel: ({ channel_id }: any) => createGlobalId(channel_id, "Channel"),
    date: ({ exp_channel_title }, _, { models }) => {
      const { day, month, year } = exp_channel_title;
      return `${models.Content.getDate(day, month, year)}`;
    },
    actualDate: ({ actual_date }, _, { models }) => {
      return `${models.Content.getDateFromUnix(actual_date)}`
    },
    siteId: ({ site_id }) => createGlobalId(site_id, "Sites"),
    channelId: ({ channel_id }: any) => createGlobalId(channel_id, "Channel"),
  },

  Content: {
    id: ({ entry_id }: any, _, $, { parentType }) => createGlobalId(entry_id, parentType.name),
    channel: ({ channel_id }: any) => createGlobalId(channel_id, "Channel"),
    channelName: ({ exp_channel }) => exp_channel.channel_name,
    title: ({ exp_channel_title }) => exp_channel_title.title,
    status: ({ exp_channel_title }) => exp_channel_title.status,
    meta: data => data,
    content: data => data,
    tracks: data => data,
    authors: ({ editorial_authors }) => {
      return editorial_authors ? editorial_authors.split(","): null
    },
  },

};
