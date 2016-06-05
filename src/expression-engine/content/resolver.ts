
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
    body: ({ body, legacy_body }, _, { models }) => models.Content.cleanMarkup(body || legacy_body),
    description: ({ description }) => description,
    scripture: () => "foo",
    ooyalaId: ({ video }) => video,
    tags: ({ tags }, _, { models }) => models.Content.splitByNewLines(tags),
    speakers: () => ["foo"],
    hashtag: ({ hashtag }) => hashtag,
    isLight: ({ lightswitch }) => lightswitch != "dark",

    images: ({ image, exp_channel, entry_id }, _, { models }) => {
      const position = exp_channel.exp_channel_fields.image;
      console.log(image, position)
      return models.File.getFilesFromContent(entry_id, image, position);
    },
    colors: data => [],
  },

  ContentMeta: {
    site: ({ site_id }) => createGlobalId(site_id, "Sites"),
    channel: ({ channel_id }: any) => createGlobalId(channel_id, "Channel"),
    series: ({ series_id }, _, $, { parentType }) => createGlobalId(series_id, parentType.name),
    urlTitle: ({ exp_channel_title }) => exp_channel_title.url_title,
    
    date: ({ exp_channel_title }, _, { models }) => {
      const { day, month, year } = exp_channel_title;
      return models.Content.getDate(day, month, year);
    },
    // XXX date fields per model
    actualDate: ({ actualdate }, _, { models }) => {
      return models.Content.getDateFromUnix(actualdate);
    },
    entryDate: ({ entrydate }, _, { models }) => {
      return models.Content.getDateFromUnix(entrydate);
    },
    startDate: ({ startdate }, _, { models }) => {
      return models.Content.getDateFromUnix(startdate);
    },
    endDate: ({ enddate }, _, { models }) => {
      return models.Content.getDateFromUnix(enddate);
    },
    
    // deprecated
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
    authors: ({ editorial_authors }) => {
      return editorial_authors ? editorial_authors.split(","): null
    },
    
    // deprecated
    tracks: data => data,
    seriesId: ({ series_id }, _, $, { parentType }) => createGlobalId(series_id, parentType.name),
  },

};
