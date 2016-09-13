
import test from "ava";
import { difference } from "lodash";
import { createGlobalId } from "../../../../src/util";
import Resolver from "../../../../src/expression-engine/models/content/resolver";

const sampleData = {
  live: {
    isLive: true,
    snippet_contents: "the snippet contents",
  },
  contentColor: {
    id: "theId",
    value: "theValue",
    description: "theDescription",
  },
  contentScripture: {
    book: "theBook",
    passage: "thePassage",
  },
};

const eeChannels = [
  "devotionals",
  "articles",
  "series_newspring",
  "sermons",
  "stories",
  "newspring_albums",
];

test("`Query` should have a content function", t => {
  const { Query } = Resolver;

  t.truthy(Query.content);
});

test("`Query` content should call model find with vars", t => {
  const { Query } = Resolver;
  const mockData = {
    channel: "channel1",
    skip: 1,
    limit: 2,
    status: "yep",
    cache: {
      things: "things",
    },
  };
  const models = {
    Content: {
      find: (object, cache) => {
        t.is(object.channel_name, mockData.channel);
        t.is(object.offset, mockData.skip);
        t.is(object.limit, mockData.limit);
        t.is(object.status, mockData.status);
        t.deepEqual(cache, mockData.cache);
      },
    },
  };

  Query.content({}, mockData, { models });
});

test("`Query` should have a feed function", t => {
  const { Query } = Resolver;

  t.truthy(Query.feed);
});

test("`Query` feed should call model find with vars", t => {
  const { Query } = Resolver;
  const mockData = {
    excludeChannels: [],
    limit: 1,
    skip: 2,
    status: "yep",
    cache: {
      things: "things",
    },
  };
  const models = {
    Content: {
      find: (object, cache) => {
        t.deepEqual(object.channel_name, { $or: eeChannels });
        t.is(object.offset, mockData.skip);
        t.is(object.limit, mockData.limit);
        t.is(object.status, mockData.status);
      },
    },
  };

  Query.feed({}, mockData, { models });
});

test("`Query` feed should lower case and exclude channels passed in", t => {
  const { Query } = Resolver;
  const mockData = {
    excludeChannels: ["Devotionals"],
    limit: 1,
    skip: 2,
    status: "yep",
    cache: {
      things: "things",
    },
  };
  const models = {
    Content: {
      find: (object, cache) => {
        t.deepEqual(object.channel_name, { $or: difference(eeChannels, ["devotionals"]) });
      },
    },
  };

  Query.feed({}, mockData, { models });
});

test("`Query` feed should lower case, convert, and exclude Series and Music", t => {
  const { Query } = Resolver;
  const mockData = {
    excludeChannels: ["Series", "Music"],
    limit: 1,
    skip: 2,
    status: "yep",
    cache: {
      things: "things",
    },
  };
  const models = {
    Content: {
      find: (object, cache) => {
        t.deepEqual(object.channel_name, { $or: difference(eeChannels, ["series_newspring", "albums_newspring"]) });
      },
    },
  };

  Query.feed({}, mockData, { models });
});

test("`Query` should have taggedContent function", t => {
  const { Query } = Resolver;

  t.truthy(Query.taggedContent);
});

test("`Query` taggedContent should return null if no tag info", t => {
  const { Query } = Resolver;
  const mockData = {
    includeChannels: [],
    tagName: null,
    tags: null,
    limit: 1,
    skip: 2,
    cache: {
      things: "things",
    },
    excludedIds: [3],
  };
  const models = {};

  const result = Query.taggedContent({}, mockData, { models });

  t.falsy(result);
});

test("`Query` taggedContent should call model findByTagName if tagName", t => {
  const { Query } = Resolver;
  const mockData = {
    includeChannels: ["tag1"],
    tagName: "tagggggggggg",
    tags: null,
    limit: 1,
    skip: 2,
    cache: {
      things: "things",
    },
    excludedIds: [3],
  };
  const models = {
    Content: {
      findByTagName: (params, options, cache) => {
        t.is(params.tagName, mockData.tagName);
        t.deepEqual(params.includeChannels, mockData.includeChannels);
        t.is(options.offset, mockData.skip);
        t.is(options.limit, mockData.limit);
        t.deepEqual(cache, mockData.cache);
      },
    },
  };

  Query.taggedContent({}, mockData, { models });
});

test("`Query` taggedContent should call modal findByTags if tags", t => {
  const { Query } = Resolver;
  const mockData = {
    includeChannels: ["tag1"],
    tagName: null,
    tags: ["tag2", "tag3", "tag4"],
    limit: 1,
    skip: 2,
    cache: {
      things: "things",
    },
    excludedIds: [3],
  };
  const models = {
    Content: {
      findByTags: (params, options, cache) => {
        t.deepEqual(params.tags, mockData.tags);
        t.deepEqual(params.includeChannels, mockData.includeChannels);
        t.deepEqual(params.excludedIds, mockData.excludedIds);
        t.is(options.offset, mockData.skip);
        t.is(options.limit, mockData.limit);
        t.deepEqual(cache, mockData.cache);
      },
    },
  };

  Query.taggedContent({}, mockData, { models });
});

test("`Query` lowReorderSets should exist", t => {
  const { Query } = Resolver;

  t.truthy(Query.lowReorderSets);
});

test("`Query` lowReorderSets should call model function with vars", t => {
  const { Query } = Resolver;
  const mockData = {
    setName: "nav",
  };
  const models = {
    Content: {
      getFromLowReorderSet: (setName) => {
        t.is(setName, mockData.setName);
      },
    },
  };

  Query.lowReorderSets({}, mockData, { models });
});

test("`Query` live should exist", t => {
  const { Query } = Resolver;

  t.truthy(Query.live);
});

test("`Query` live should call model", t => {
  const { Query } = Resolver;
  const models = {
    Content: {
      getLiveStream: () => {
        t.pass();
      },
    },
  };

  Query.live({}, {}, { models });
});

test("`LiveFeed` should return the live flag", t => {
  const { LiveFeed } = Resolver;

  const isLive = LiveFeed.live(sampleData.live);

  t.deepEqual(isLive, sampleData.live.isLive);
});

test("`LiveFeed` should reurn the embedCode", t => {
  const { LiveFeed } = Resolver;

  const embedCode = LiveFeed.embedCode(sampleData.live);

  t.deepEqual(embedCode, sampleData.live.snippet_contents);
});

test("`ContentColor` returns the color id", t => {
  const { ContentColor } = Resolver;

  const id = ContentColor.id(sampleData.contentColor);

  t.deepEqual(id, sampleData.contentColor.id);
});

test("`ContentColor` returns the color value", t => {
  const { ContentColor } = Resolver;

  const value = ContentColor.value(sampleData.contentColor);

  t.deepEqual(value, sampleData.contentColor.value);
});

test("`ContentColor` returns the color description", t => {
  const { ContentColor } = Resolver;

  const description = ContentColor.description(sampleData.contentColor);

  t.deepEqual(description, sampleData.contentColor.description);
});

test("`ContentScripture` returns book", t => {
  const { ContentScripture } = Resolver;

  const book = ContentScripture.book(sampleData.contentScripture);

  t.deepEqual(book, sampleData.contentScripture.book);
});

test("`ContentScripture` returns the passage", t => {
  const { ContentScripture } = Resolver;

  const passage = ContentScripture.passage(sampleData.contentScripture);

  t.deepEqual(passage, sampleData.contentScripture.passage);
});

test("`ContentData` should call cleanMarkup with body", t => {
  const { ContentData } = Resolver;
  const mockData = {
    body: "test",
    legacy_body: null,
  };
  const models = {
    Content: {
      cleanMarkup: (markup) => {
        t.is(markup, mockData.body);
      },
    },
  };

  ContentData.body(mockData, {}, { models });
});

test("`ContentData` should call cleanMarkup with legacy_body if no body", t => {
  const { ContentData } = Resolver;
  const mockData = {
    body: null,
    legacy_body: "test",
  };
  const models = {
    Content: {
      cleanMarkup: (markup) => {
        t.is(markup, mockData.legacy_body);
      },
    },
  };

  ContentData.body(mockData, {}, { models });
});

test("`ContentData` should return description", t => {
  const { ContentData } = Resolver;
  const mockData = {
    description: "description",
  };

  const description = ContentData.description(mockData);
  t.is(description, mockData.description);
});

test("`ContentData` should return ooyalaId", t => {
  const { ContentData } = Resolver;
  const mockData = {
    video: "id",
  };

  const ooyalaId = ContentData.ooyalaId(mockData);
  t.is(ooyalaId, mockData.video);
});

test("`ContentData` should call splitByNewLines", t => {
  const { ContentData } = Resolver;
  const mockData = {
    tags: "tags",
  };
  const models = {
    Content: {
      splitByNewLines: (tags) => {
        t.is(tags, mockData.tags);
      },
    },
  };

  ContentData.tags(mockData, {}, { models });
});

test("`ContentData` should return speaker", t => {
  const { ContentData } = Resolver;
  const mockData = {
    speaker: "speaker",
  };

  const speaker = ContentData.speaker(mockData);
  t.is(speaker, mockData.speaker);
});

test("`ContentData` should return hashtag", t => {
  const { ContentData } = Resolver;
  const mockData = {
    hashtag: "hashtag",
  };

  const hashtag = ContentData.hashtag(mockData);
  t.is(hashtag, mockData.hashtag);
});

test("`ContentData` should return foreground_color not dark", t => {
  const { ContentData } = Resolver;
  const mockData = {
    lightswitch: null,
    foreground_color: "dark",
  };

  const isLight = ContentData.isLight(mockData);
  t.is(isLight, mockData.foreground_color !== "dark");
});

test("`ContentData` should return lightswitch not dark for isLight if no foreground_color", t => {
  const { ContentData } = Resolver;
  const mockData = {
    lightswitch: "dark",
    foreground_color: null,
  };

  const isLight = ContentData.isLight(mockData);
  t.is(isLight, mockData.lightswitch !== "dark");
});

test("`ContentData` should return blank array if no scripture", t => {
  const { ContentData } = Resolver;
  const mockData = {
    entry_id: "1",
    scripture: null,
    exp_channel: {},
  };
  const models = {};

  const scripture = ContentData.scripture(mockData, {}, { models });
  t.deepEqual(scripture, []);
});

test("`ContentData` should call getContentFromMatrix with position if scripture", t => {
  const { ContentData } = Resolver;
  const mockData = {
    entry_id: "1",
    scripture: "scripture",
    exp_channel: {
      exp_channel_fields: {
        scripture: "field_id_345",
      },
    },
  };
  const models = {
    Content: {
      getContentFromMatrix: (entry_id, scripture, position) => {
        t.is(entry_id, mockData.entry_id);
        t.is(scripture, mockData.scripture);
        t.is(position, 345);
      },
    },
  };

  ContentData.scripture(mockData, {}, { models });
});

test("`ContentData` should return blank array if no bgcolor and no color", t => {
  const { ContentData } = Resolver;
  const mockData = {
    bgcolor: null,
    fgcolor: null,
    color: null,
  };

  const colors = ContentData.colors(mockData);
  t.deepEqual(colors, []);
});

test("`ContentData` should return color and primary if color", t => {
  const { ContentData } = Resolver;
  const mockData = {
    bgcolor: null,
    fgcolor: null,
    color: "green",
  };

  const colors = ContentData.colors(mockData);
  t.deepEqual(
    colors,
    [{
      value: mockData.color,
      description: "primary",
    }]
  );
});

// test("`ContentData` should prioritize fgcolor over bgcolor", t => {
//   const { ContentData } = Resolver;
//   const mockData = {
//     bgcolor: "blue",
//     fgcolor: "orange",
//     color: null,
//   };

//   const colors = ContentData.colors(mockData);
//   t.deepEqual(
//     colors,
//     [{
//       value: mockData.fgcolor,
//       description: "primary",
//     }]
//   );
// });

test("`ContentData` should return bgcolor and primary if no color", t => {
  const { ContentData } = Resolver;
  const mockData = {
    bgcolor: "red",
    fgcolor: null,
    color: null,
  };

  const colors = ContentData.colors(mockData);
  t.deepEqual(
    colors,
    [{
      value: mockData.bgcolor,
      description: "primary",
    }]
  );
});

test("`ContentData` returns blank array if no audio or tracks", async (t) => {
  const { ContentData } = Resolver;
  const mockData = {
    entry_id: "testId",
    audio: null,
    tracks: null,
    exp_channel: {},
    audio_duration: null,
  };
  const models = {};

  await ContentData.audio(mockData, null, { models });
});

test("`ContentData` fetches audio files if audio", async (t) => {
  const { ContentData } = Resolver;
  const mockData = {
    entry_id: "testId",
    audio: "audio.mp3",
    tracks: null,
    exp_channel: {
      exp_channel_fields: {
        audio: "test_field_123",
      },
    },
    audio_duration: "1:23",
  };
  const models = {
    File: {
      getFilesFromContent: (entry_id, audio, audioPosition, duration) => {
        t.is(entry_id, mockData.entry_id);
        t.is(audio, mockData.audio);
        t.is(audioPosition, Number(mockData.exp_channel.exp_channel_fields.audio.split("_").pop()));
        t.is(duration, mockData.audio_duration);
      },
    },
  };

  await ContentData.audio(mockData, null, { models });
});

test("`ContentData` fetches tracks files if tracks", async (t) => {
  const { ContentData } = Resolver;
  const mockData = {
    entry_id: "testId",
    audio: null,
    tracks: "audio.mp3",
    exp_channel: {
      exp_channel_fields: {
        tracks: "test_field_789",
      },
    },
    audio_duration: null,
  };
  const models = {
    File: {
      getFilesFromContent: (entry_id, tracks, trackPosition) => {
        t.is(entry_id, mockData.entry_id);
        t.is(tracks, mockData.tracks);
        t.is(trackPosition, Number(mockData.exp_channel.exp_channel_fields.tracks.split("_").pop()));
      },
    },
  };

  await ContentData.audio(mockData, null, { models });
});

test("`ContentData` fetches audio and tracks files if both", async (t) => {
  const { ContentData } = Resolver;
  const mockData = {
    entry_id: "testId",
    audio: "audio.mp3",
    tracks: "track.mp3",
    exp_channel: {
      exp_channel_fields: {
        audio: "test_field_123",
        tracks: "test_field_789",
      },
    },
    audio_duration: "1:23",
  };
  let count = 0;
  const models = {
    File: {
      getFilesFromContent: (entry_id, thing, thingPosition, duration) => {
        count++;
        t.is(entry_id, mockData.entry_id);
        t.true([mockData.audio, mockData.tracks].indexOf(thing) > -1);
        const splitField = thing === mockData.audio ?
          Number(mockData.exp_channel.exp_channel_fields.audio.split("_").pop()) :
          Number(mockData.exp_channel.exp_channel_fields.tracks.split("_").pop())
        ;
        t.is(thingPosition, splitField);
        if (thing === mockData.audio) {
          t.is(duration, mockData.audio_duration);
        }
      },
    },
  };

  await ContentData.audio(mockData, null, { models });
  t.is(count, 2);
});

test("`ContentData` returns blank array if no image or blurred image", async (t) => {
  const { ContentData } = Resolver;
  const mockData = {
    image: null,
    image_blurred: null,
    exp_channel: {},
    entry_id: 1,
  };
  const mockParams = {
    sizes: null,
    ratios: null,
  };
  const models = {};

  const result = await ContentData.images(mockData, mockParams, { models });
  t.deepEqual(result, []);
});

test("`ContentData` calls model with image position when image", async (t) => {
  const { ContentData } = Resolver;
  const mockData = {
    image: "test.jpg",
    image_blurred: null,
    exp_channel: {
      exp_channel_fields: {
        image: "test_field_123",
      },
    },
    entry_id: 1,
  };
  const mockParams = {
    sizes: null,
    ratios: null,
  };
  const models = {
    File: {
      getFilesFromContent: (entry_id, thing, position) => {
        t.is(entry_id, mockData.entry_id);
        t.is(thing, mockData.image);
        const splitField = Number(mockData.exp_channel.exp_channel_fields.image.split("_").pop());
        t.is(position, splitField);
      },
    },
  };

  await ContentData.images(mockData, mockParams, { models });
});

test("`ContentData` calls model with blurred image position when blurred image", async (t) => {
  const { ContentData } = Resolver;
  const mockData = {
    image: null,
    image_blurred: "blurry.jpg",
    exp_channel: {
      exp_channel_fields: {
        image_blurred: "test_field_789",
      },
    },
    entry_id: 2,
  };
  const mockParams = {
    sizes: null,
    ratios: null,
  };
  const models = {
    File: {
      getFilesFromContent: (entry_id, thing, position) => {
        t.is(entry_id, mockData.entry_id);
        t.is(thing, mockData.image_blurred);
        const splitField = Number(mockData.exp_channel.exp_channel_fields.image_blurred.split("_").pop());
        t.is(position, splitField);
      },
    },
  };

  await ContentData.images(mockData, mockParams, { models });
});

test("`ContentData` calls model twice if both image and blurred image", async (t) => {
  const { ContentData } = Resolver;
  const mockData = {
    image: "image.jpg",
    image_blurred: "blurry.jpg",
    exp_channel: {
      exp_channel_fields: {
        image: "test_field_234",
        image_blurred: "test_field_678",
      },
    },
    entry_id: 3,
  };
  const mockParams = {
    sizes: null,
    ratios: null,
  };
  let count = 0;
  const models = {
    File: {
      getFilesFromContent: (entry_id, thing, position) => {
        count++;
        t.is(entry_id, mockData.entry_id);
        t.true([mockData.image, mockData.image_blurred].indexOf(thing) > -1);
        const splitField = thing === mockData.image ?
          Number(mockData.exp_channel.exp_channel_fields.image.split("_").pop()) :
          Number(mockData.exp_channel.exp_channel_fields.image_blurred.split("_").pop())
        ;
        t.is(position, splitField);
      },
    },
  };

  await ContentData.images(mockData, mockParams, { models });
  t.is(count, 2);
});

test("`ContentData` returns 5 resized images if image", async (t) => {
  const { ContentData } = Resolver;
  const mockData = {
    image: "image.jpg",
    image_blurred: null,
    exp_channel: {
      exp_channel_fields: {
        image: "test_field_123",
      },
    },
    entry_id: 1,
  };
  const mockParams = {
    sizes: null,
    ratios: null,
  };
  const models = {
    File: {
      getFilesFromContent: (entry_id, thing, position) => {
        return Promise.resolve([
          {
            url: "url.jpg",
          },
        ]);
      },
    },
  };

  const result = await ContentData.images(mockData, mockParams, { models });
  t.is(result.length, 5);
});

test("`ContentData` returns 10 resized images if image and blurred image", async (t) => {
  const { ContentData } = Resolver;
  const mockData = {
    image: "image.jpg",
    image_blurred: "blurry.jpg",
    exp_channel: {
      exp_channel_fields: {
        image: "test_field_123",
        image_blurred: "test_field_789",
      },
    },
    entry_id: 1,
  };
  const mockParams = {
    sizes: null,
    ratios: null,
  };
  const models = {
    File: {
      getFilesFromContent: (entry_id, thing, position) => {
        return Promise.resolve([
          {
            url: "url.jpg",
          },
        ]);
      },
    },
  };

  const result = await ContentData.images(mockData, mockParams, { models });
  t.is(result.length, 10);
});

test("`ContentData` returns only image size specified", async (t) => {
  const { ContentData } = Resolver;
  const mockData = {
    image: "image.jpg",
    image_blurred: null,
    exp_channel: {
      exp_channel_fields: {
        image: "test_field_123",
      },
    },
    entry_id: 1,
  };
  const mockParams = {
    sizes: ["small"],
    ratios: null,
  };
  const models = {
    File: {
      getFilesFromContent: (entry_id, thing, position) => {
        return Promise.resolve([
          {
            url: "url.jpg",
          },
        ]);
      },
    },
  };

  const result = await ContentData.images(mockData, mockParams, { models });
  t.is(result.length, 1);
  t.true(result[0].url.indexOf("small") > -1);
  t.is(result[0].size, "small");
});

test("`ContentData` returns only ratio specified", async (t) => {
  const { ContentData } = Resolver;
  const mockData = {
    image: "image.jpg",
    image_blurred: null,
    exp_channel: {
      exp_channel_fields: {
        image: "test_field_123",
      },
    },
    entry_id: 1,
  };
  const mockParams = {
    sizes: null,
    ratios: ["2:1"],
  };
  const models = {
    File: {
      getFilesFromContent: (entry_id, thing, position) => {
        return Promise.resolve([
          {
            url: "url.jpg",
            fileLabel: "1:2",
          },
          {
            url: "url.jpg",
            fileLabel: "2:1",
          },
        ]);
      },
    },
  };

  const result = await ContentData.images(mockData, mockParams, { models });
  t.is(result.length, 5);
  result.map((image) => {
    t.is(image.fileLabel, "2:1");
  });
});

test("`ContentMeta` should exist", t => {
  const { ContentMeta } = Resolver;
  t.truthy(ContentMeta);
});

test("`ContentMeta` should return global id of site_id", t => {
  const { ContentMeta } = Resolver;
  const mockData = {
    site_id: "1",
  };

  const site = ContentMeta.site(mockData);
  t.is(site, createGlobalId(mockData.site_id, "Sites"));
});

test("`ContentMeta` should return global id of channel_id", t => {
  const { ContentMeta } = Resolver;
  const mockData = {
    channel_id: "2",
  };

  const channel = ContentMeta.channel(mockData);
  t.is(channel, createGlobalId(mockData.channel_id, "Channel"));
});

test("`ContentMeta` should return global id of series_id", t => {
  const { ContentMeta } = Resolver;
  const mockData = {
    series_id: "3",
  };
  const parentType = {
    name: "suchparent",
  };

  const series = ContentMeta.series(mockData, {}, {}, { parentType });
  t.is(series, createGlobalId(mockData.series_id, parentType.name));
});

test("`ContentMeta` should return url for urlTitle", t => {
  const { ContentMeta } = Resolver;
  const mockData = {
    url: "url",
    exp_channel_title: {
      url_title: "title",
    },
  };

  const urlTitle = ContentMeta.urlTitle(mockData);
  t.is(urlTitle, mockData.url);
});

test("`ContentMeta` should return false if no url and no exp_channel_title", t => {
  const { ContentMeta } = Resolver;
  const mockData = {
    url: null,
    exp_channel_title: null,
  };

  const urlTitle = ContentMeta.urlTitle(mockData);
  t.falsy(urlTitle);
});

test("`ContentMeta` should return false if no url and no url_title", t => {
  const { ContentMeta } = Resolver;
  const mockData = {
    url: null,
    exp_channel_title: {
      url_title: null,
    },
  };

  const urlTitle = ContentMeta.urlTitle(mockData);
  t.falsy(urlTitle);
});

test("`ContentMeta` should return url_title if no url", t => {
  const { ContentMeta } = Resolver;
  const mockData = {
    url: null,
    exp_channel_title: {
      url_title: "meow",
    },
  };

  const urlTitle = ContentMeta.urlTitle(mockData);
  t.is(urlTitle, mockData.exp_channel_title.url_title);
});

test("`ContentMeta` should return summary if summary", async (t) => {
  const { ContentMeta } = Resolver;
  const mockData = {
    summary: "summary",
    body: null,
    legacy_body: null,
  };
  const models = {};

  const summary = await ContentMeta.summary(mockData, {}, { models });
  t.is(summary, mockData.summary);
});

test("`ContentMeta` should call cleanMarkup with body if no summary", async (t) => {
  const { ContentMeta } = Resolver;
  const mockData = {
    summary: null,
    body: "body",
    legacy_body: "legacy_body",
  };
  const models = {
    Content: {
      cleanMarkup: (markup) => {
        t.is(markup, mockData.body);
      },
    },
  };

  await ContentMeta.summary(mockData, {}, { models });
});

test("`ContentMeta` should call cleanMarkup with legacy_body if no summary or body", async (t) => {
  const { ContentMeta } = Resolver;
  const mockData = {
    summary: null,
    body: null,
    legacy_body: "legacy_body",
  };
  const models = {
    Content: {
      cleanMarkup: (markup) => {
        t.is(markup, mockData.legacy_body);
      },
    },
  };

  await ContentMeta.summary(mockData, {}, { models });
});

test("`ContentMeta` should null if no body, legacy_body, or summary", async (t) => {
  const { ContentMeta } = Resolver;
  const mockData = {
    summary: null,
    body: null,
    legacy_body: null,
  };
  const models = {
    Content: {
      cleanMarkup: (markup) => {
        return null;
      },
    },
  };

  const summary = await ContentMeta.summary(mockData, {}, { models });
  t.is(summary, null);
});

test("`ContentMeta` date should call getData on model", t => {
  const { ContentMeta } = Resolver;
  const mockData = {
    exp_channel_title: {
      day: "day",
      month: "month",
      year: "year",
    },
  };
  const models = {
    Content: {
      getDate: (day, month, year) => {
        t.is(day, mockData.exp_channel_title.day);
        t.is(month, mockData.exp_channel_title.month);
        t.is(year, mockData.exp_channel_title.year);
      },
    },
  };

  ContentMeta.date(mockData, {}, { models });
});

test("`ContentMeta` actualDate should call getDateFromUnix", t => {
  const { ContentMeta } = Resolver;
  const mockData = {
    actualdate: "date",
  };
  const models = {
    Content: {
      getDateFromUnix: (actualDate) => {
        t.is(actualDate, mockData.actualdate);
      },
    },
  };

  ContentMeta.actualDate(mockData, {}, { models });
});

test("`ContentMeta` entryDate should call getDateFromUnix", t => {
  const { ContentMeta } = Resolver;
  const mockData = {
    entrydate: "date",
  };
  const models = {
    Content: {
      getDateFromUnix: (entryDate) => {
        t.is(entryDate, mockData.entrydate);
      },
    },
  };

  ContentMeta.entryDate(mockData, {}, { models });
});

test("`ContentMeta` startDate should call getDateFromUnix", t => {
  const { ContentMeta } = Resolver;
  const mockData = {
    startdate: "date",
  };
  const models = {
    Content: {
      getDateFromUnix: (startDate) => {
        t.is(startDate, mockData.startdate);
      },
    },
  };

  ContentMeta.startDate(mockData, {}, { models });
});

test("`ContentMeta` endDate should call getDateFromUnix", t => {
  const { ContentMeta } = Resolver;
  const mockData = {
    enddate: "date",
  };
  const models = {
    Content: {
      getDateFromUnix: (endDate) => {
        t.is(endDate, mockData.enddate);
      },
    },
  };

  ContentMeta.endDate(mockData, {}, { models });
});

test("`Content` should exist", t => {
  const { Content } = Resolver;
  t.truthy(Content);
});

test("`Content` should return global id for id", t => {
  const { Content } = Resolver;
  const mockData = {
    entry_id: "1",
  };
  const parentType = {
    name: "parent",
  };

  const id = Content.id(mockData, {}, {}, { parentType });
  t.is(id, createGlobalId(mockData.entry_id, parentType.name));
});

test("`Content` should return global id for channel", t => {
  const { Content } = Resolver;
  const mockData = {
    channel_id: "1",
  };

  const channel = Content.channel(mockData);
  t.is(channel, createGlobalId(mockData.channel_id, "Channel"));
});

test("`Content` channelName should return channel name", t => {
  const { Content } = Resolver;
  const mockData = {
    exp_channel: {
      channel_name: "channel",
    },
  };

  const channelName = Content.channelName(mockData);
  t.is(channelName, mockData.exp_channel.channel_name);
});

test("`Content` title should return title", t => {
  const { Content } = Resolver;
  const mockData = {
    exp_channel_title: {
      title: "title",
    },
  };

  const title = Content.title(mockData);
  t.is(title, mockData.exp_channel_title.title);
});

test("`Content` status should return status", t => {
  const { Content } = Resolver;
  const mockData = {
    exp_channel_title: {
      status: "status",
    },
  };

  const status = Content.status(mockData);
  t.is(status, mockData.exp_channel_title.status);
});

test("`Content` parent should call findByChildId", t => {
  const { Content } = Resolver;
  const mockData = {
    entry_id: "1",
  };
  const models = {
    Content: {
      findByChildId: (entry_id) => {
        t.is(entry_id, mockData.entry_id);
      },
    },
  };

  Content.parent(mockData, {}, { models });
});

test("`Content` meta should just return the data", t => {
  const { Content } = Resolver;
  const mockData = {
    thing1: "thing1",
    thing2: "thing2",
  };

  const meta = Content.meta(mockData);
  t.deepEqual(meta, mockData);
});

test("`Content` content should just return the data", t => {
  const { Content } = Resolver;
  const mockData = {
    thing3: "thing3",
    thing4: "thing4",
  };

  const content = Content.content(mockData);
  t.deepEqual(content, mockData);
});

test("`Content` authors should return null if no authors", t => {
  const { Content } = Resolver;
  const mockData = {
    editorial_authors: null,
    author: null,
  };

  const authors = Content.authors(mockData);
  t.is(authors, null);
});

test("`Content` authors should return an array of authors", t => {
  const { Content } = Resolver;
  const mockData = {
    editorial_authors: "me,you,i",
  };

  const authors = Content.authors(mockData);
  t.deepEqual(authors, ["me", "you", "i"]);
});

test("`Content` authors should prioritize author", t => {
  const { Content } = Resolver;
  const mockData = {
    editorial_authors: "me,you,i",
    author: "me,you,we",
  };

  const authors = Content.authors(mockData);
  t.deepEqual(authors, ["me", "you", "we"]);
});

test("`Content` children should call findByParentId", t => {
  const { Content } = Resolver;
  const mockData = {
    entry_id: "1",
  };
  const mockInput = {
    channels: ["channel1", "channel2"],
  };
  const models = {
    Content: {
      findByParentId: (entry_id, channels) => {
        t.is(entry_id, mockData.entry_id);
        t.deepEqual(channels, mockInput.channels);
      },
    },
  };

  Content.children(mockData, mockInput, { models });
});

test("`Content` related call splitByNewLines", t => {
  const { Content } = Resolver;
  const mockData = {
    tags: "meow\nwoof\ncool",
  };
  const mockInput = {
    includeChannels: null,
    limit: null,
    skip: null,
    cache: null,
  };
  const models = {
    Content: {
      splitByNewLines: (tags) => {
        t.is(tags, mockData.tags);
      },
    },
  };

  Content.related(mockData, mockInput, { models });
});

test("`Content` related should return null if tags falsy", t => {
  const { Content } = Resolver;
  const mockData = {
    tags: null,
  };
  const mockInput = {
    includeChannels: null,
    limit: null,
    skip: null,
    cache: null,
  };
  const models = {
    Content: {
      splitByNewLines: () => {
        return null;
      },
    },
  };

  const related = Content.related(mockData, mockInput, { models });
  t.is(related, null);
});

test("`Content` related should return null if tags is empty array", t => {
  const { Content } = Resolver;
  const mockData = {
    tags: null,
  };
  const mockInput = {
    includeChannels: null,
    limit: null,
    skip: null,
    cache: null,
  };
  const models = {
    Content: {
      splitByNewLines: () => {
        return [];
      },
    },
  };

  const related = Content.related(mockData, mockInput, { models });
  t.is(related, null);
});

test("`Content` related should call findByTags if tags", t => {
  const { Content } = Resolver;
  const mockData = {
    tags: "meow\nwoof\ncool",
  };
  const splitTags = ["meow", "woof", "cool"];
  const mockInput = {
    includeChannels: ["one", "two"],
    limit: 1,
    skip: 2,
    cache: true,
  };
  const models = {
    Content: {
      splitByNewLines: () => {
        return splitTags;
      },
      findByTags: (inputs, options, cache) => {
        t.deepEqual(inputs.tags, splitTags);
        t.deepEqual(inputs.includeChannels, mockInput.includeChannels);
        t.is(options.offset, mockInput.skip);
        t.is(options.limit, mockInput.limit);
        t.is(cache, mockInput.cache);
      },
    },
  };

  Content.related(mockData, mockInput, { models });
});

test("`Contnet` seriesId should return global id", t => {
  const { Content } = Resolver;
  const mockData = {
    series_id: "2",
  };
  const parentType = {
    name: "parent",
  };

  const seriesId = Content.seriesId(mockData, {}, {}, { parentType });
  t.is(seriesId, createGlobalId(mockData.series_id, parentType.name));
});
