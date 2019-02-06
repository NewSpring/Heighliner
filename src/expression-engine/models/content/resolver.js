import { flatten, difference } from "lodash";
import StripTags from "striptags";
import Truncate from "truncate";
import { addResizings } from "./images";
import { createGlobalId } from "../../../util";
import sortBy from "lodash/sortBy";

export default {
  Query: {
    content(_, { channel, limit, skip, status, cache }, { models }) {
      return models.Content.find(
        {
          channel_name: channel,
          offset: skip,
          limit,
          status
        },
        cache
      );
    },

    feed(_, { excludeChannels = [], limit, skip, status, cache }, { models }) {
      const allChannels = [
        "devotionals",
        "articles",
        "series_newspring",
        "sermons",
        "stories",
        "newspring_albums",
        "news"
      ];

      /*

        Currently excluded channels come in uppercase and not the actual
        channel name. Here we fix that

        XXX make the setting dynamic and pulled from heighliner

      */
      excludeChannels = excludeChannels
        .map(x => x.toLowerCase())
        .map(x => {
          if (x === "series") return "series_newspring";
          if (x === "music") return "newspring_albums";
          return x;
        });

      // only include what user hasn't excluded
      let channels = difference(allChannels, excludeChannels);
      // ensure channels aren't empty
      if (channels.length === 0) {
        channels = allChannels;
      }
      return models.Content.find(
        {
          channel_name: { $or: channels },
          offset: skip,
          limit,
          status
        },
        cache
      );
    },

    taggedContent(
      _,
      { includeChannels, tagName, tags, limit, skip, cache, excludedIds },
      { models }
    ) {
      if (tagName) {
        return models.Content.findByTagName(
          { tagName, includeChannels },
          { offset: skip, limit },
          cache
        );
      }

      if (tags) {
        return models.Content.findByTags(
          { tags, includeChannels, excludedIds },
          { offset: skip, limit },
          cache
        );
      }

      return null;
    },

    lowReorderSets(_, { setName }, { models }) {
      return models.Content.getFromLowReorderSet(setName);
    },

    live(_, $, { models }) {
      return models.Content.getLiveStream();
    },

    contentWithUrlTitle(_, { channel, urlTitle }, { models }) {
      return models.Content.findByUrlTitle(channel, urlTitle);
    }
  },

  LiveFeed: {
    live: ({ isLive }) => !!isLive,
    fuse: () => false,
    embedCode: ({ snippet_contents }) => snippet_contents,
    embedUrl: ({ snippet_contents: video }) => {
      // video = 'V1a2xxZDE6g-BJTbHZEU8N37nDPFFWq1';
      if (!video) return null;
      const pbid = "ZmJmNTVlNDk1NjcwYTVkMzAzODkyMjg0";
      const pcode = "E1dWM6UGncxhent7MRATc3hmkzUD";
      const playerConfig = encodeURIComponent(
        "https://my.newspring.cc/ooyala/skin.new.json"
      );

      const embedUrl = `https://player.ooyala.com/static/v4/production/latest/skin-plugin/iframe.html?ec=${video}&pbid=${pbid}&pcode=${pcode}&skin.config=${playerConfig}`;

      return embedUrl;
    },
    videoUrl: ({ snippet_contents: video }) =>
      `https://secure-cf-c.ooyala.com/${video}/DOcJ-FxaFrRg4gtDEwOjI5cDowODE7AZ`
  },

  ContentColor: {
    id: ({ id }) => id,
    value: ({ value }) => value,
    description: ({ description }) => description
  },

  ContentScripture: {
    book: ({ book }) => book,
    passage: ({ passage }) => passage
  },

  ContentVideo: {
    id: ({ hashed_id }) => hashed_id || null,
    embedUrl: (
      { hashed_id } // eslint_disable_line
    ) =>
      hashed_id ? `http://fast.wistia.net/embed/iframe/${hashed_id}` : null,
    videoUrl: ({ assets = [] }) =>
      assets
        ? (assets.find(({ type }) => type === "HdMp4VideoFile") || {}).url
        : null
  },

  ContentData: {
    body: ({ body, legacy_body }, _, { models }) =>
      models.Content.cleanMarkup(body || legacy_body),
    description: ({ description }) => description,
    ooyalaId: ({ video }) => video,
    wistiaId: ({ video }) => video,
    video: ({ video }) => ({ hashed_id: video }),
    tags: ({ tags }, _, { models }) => models.Content.splitByNewLines(tags),
    speaker: ({ speaker }) => speaker,
    hashtag: ({ hashtag }) => hashtag,
    isLight: ({ lightswitch, foreground_color }) =>
      (foreground_color || lightswitch) !== "dark",
    scripture: ({ entry_id, scripture, exp_channel }, _, { models }) => {
      if (!scripture) return [];

      const position = Number(
        exp_channel.exp_channel_fields.scripture.split("_").pop()
      );
      return models.Content.getContentFromMatrix(entry_id, scripture, position);
    },
    images: (
      { image, image_blurred, exp_channel, entry_id },
      { sizes, ratios },
      { models }
    ) => {
      if (!image && !image_blurred) return Promise.all([]);

      const imagePromises = [];

      let position;
      if (image) {
        position = Number(
          exp_channel.exp_channel_fields.image.split("_").pop()
        );
        imagePromises.push(
          models.File.getFilesFromContent(entry_id, image, position)
        );
      }

      let blurredPosition;
      if (image_blurred) {
        blurredPosition = Number(
          exp_channel.exp_channel_fields.image_blurred.split("_").pop()
        );
        imagePromises.push(
          models.File.getFilesFromContent(
            entry_id,
            image_blurred,
            blurredPosition
          )
        );
      }

      return Promise.all(imagePromises)
        .then(data => flatten(data))
        .then(data => addResizings(data, { sizes, ratios }));
    },
    colors: ({ bgcolor, fgcolor, color }) => {
      if (!bgcolor && !color && !fgcolor) return [];

      return [
        {
          // XXX handle multiple colors in app + light / dark switch
          value: color || fgcolor || bgcolor,
          // value: color || bgcolor || fgcolor,
          description: "primary"
        }
      ];
    },
    // deprecated
    tracks: ({ entry_id, tracks, exp_channel }, _, { models }) => {
      if (!tracks) return [];

      const position = Number(
        exp_channel.exp_channel_fields.tracks.split("_").pop()
      );
      return models.File.getFilesFromContent(entry_id, tracks, position);
    },
    audio: (
      { entry_id, audio, tracks, exp_channel, audio_duration },
      _,
      { models }
    ) => {
      if (!audio && !tracks) return Promise.all([]);
      const getAllFiles = [];

      if (audio) {
        const audioPosition = Number(
          exp_channel.exp_channel_fields.audio.split("_").pop()
        );
        getAllFiles.push(
          models.File.getFilesFromContent(
            entry_id,
            audio,
            audioPosition,
            audio_duration
          )
        );
      }

      if (tracks) {
        const trackPosition = Number(
          exp_channel.exp_channel_fields.tracks.split("_").pop()
        );
        getAllFiles.push(
          models.File.getFilesFromContent(entry_id, tracks, trackPosition)
        );
      }

      return Promise.all(getAllFiles).then(data => flatten(data));
    },
    isLiked({ entry_id }, $, { models, person = {} }) {
      return models.Like.hasUserLike({
        userId: person.PrimaryAliasId,
        entryId: entry_id,
        entryType: "Content"
      });
    }
  },

  ContentMeta: {
    site: ({ site_id }) => createGlobalId(site_id, "Sites"),
    channel: ({ channel_id }) => createGlobalId(channel_id, "Channel"),
    series: ({ series_id }, _, $, { parentType }) =>
      createGlobalId(series_id, parentType.name),
    urlTitle: ({ url, exp_channel_title }) =>
      url || (exp_channel_title && exp_channel_title.url_title),
    summary: async ({ summary, body, legacy_body }, _, { models }) => {
      if (summary) return summary;

      const markup = await models.Content.cleanMarkup(body || legacy_body);
      if (markup) return Truncate(StripTags(markup), 140);
      return null;
    },

    date: ({ exp_channel_title }, _, { models }) => {
      const { day, month, year } = exp_channel_title;
      return models.Content.getDate(day, month, year);
    },
    // XXX date fields per model
    actualDate: ({ actualdate }, _, { models }) =>
      models.Content.getDateFromUnix(actualdate),
    entryDate: ({ entrydate }, _, { models }) =>
      models.Content.getDateFromUnix(entrydate),
    startDate: ({ startdate }, _, { models }) =>
      models.Content.getDateFromUnix(startdate),
    endDate: ({ enddate }, _, { models }) =>
      models.Content.getDateFromUnix(enddate),

    // deprecated
    siteId: ({ site_id }) => createGlobalId(site_id, "Sites"),
    channelId: ({ channel_id }) => createGlobalId(channel_id, "Channel")
  },

  Content: {
    id: ({ entry_id }, _, $, { parentType }) =>
      createGlobalId(entry_id, parentType.name),
    channel: ({ channel_id }) => createGlobalId(channel_id, "Channel"),
    channelName: ({ exp_channel }) => exp_channel.channel_name,
    campus: ({ campus }, _, { models }) =>
      // campus is playa formatted like "[id] [clemson] Clemson"
      campus
        ? models.Campus.find({ Name: campus.split(" ")[2] }).then(x =>
            x.shift()
          )
        : null,
    title: ({ exp_channel_title }) => exp_channel_title.title,
    status: ({ exp_channel_title }) => exp_channel_title.status,
    parent: ({ entry_id }, _, { models }) =>
      models.Content.findByChildId(entry_id),
    meta: data => data,
    content: data => data,
    authors: ({ editorial_authors, author }) => {
      const authors = author || editorial_authors;
      return authors ? authors.split(",") : null;
    },
    children: ({ entry_id }, { channels, showFutureEntries }, { models }) =>
      models.Content.findByParentId(entry_id, channels, showFutureEntries).then(
        x => sortBy(x, item => item.exp_channel_title.entry_date)
      ),
    related: (
      { tags },
      { includeChannels, limit, skip, cache },
      { models }
    ) => {
      tags = models.Content.splitByNewLines(tags);
      if (!tags || !tags.length) return null;

      return models.Content.findByTags(
        { tags, includeChannels },
        { offset: skip, limit },
        cache
      );
    },
    // deprecated
    tracks: ({ entry_id, tracks, exp_channel }, _, { models }) => {
      if (!tracks) return [];

      const position = Number(
        exp_channel.exp_channel_fields.tracks.split("_").pop()
      );
      return models.File.getFilesFromContent(entry_id, tracks, position);
    },
    seriesId: ({ series_id }, _, $, { parentType }) =>
      createGlobalId(series_id, parentType.name)
  }
};
