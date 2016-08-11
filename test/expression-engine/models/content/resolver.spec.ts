
import test from "ava";
import { difference } from "lodash";
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

// XXX test all of this resolver

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
