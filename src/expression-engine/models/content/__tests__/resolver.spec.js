import { difference } from "lodash";
import { createGlobalId } from "../../../../util";
import Resolver from "../resolver";

const sampleData = {
  live: {
    isLive: true
  },
  contentColor: {
    id: "theId",
    value: "theValue",
    description: "theDescription"
  },
  contentScripture: {
    book: "theBook",
    passage: "thePassage"
  }
};

const eeChannels = [
  "devotionals",
  "articles",
  "series_newspring",
  "sermons",
  "stories",
  "newspring_albums",
  "news"
];

it("`Query` should have a content function", () => {
  const { Query } = Resolver;

  expect(Query.content).toBeTruthy();
});

it("`Query` content should call model find with vars", () => {
  const { Query } = Resolver;
  const mockData = {
    channel: "channel1",
    skip: 1,
    limit: 2,
    status: "yep",
    cache: {
      things: "things"
    }
  };
  const models = {
    Content: {
      find: (object, cache) => {
        expect(object.channel_name).toEqual(mockData.channel);
        expect(object.offset).toEqual(mockData.skip);
        expect(object.limit).toEqual(mockData.limit);
        expect(object.status).toEqual(mockData.status);
        expect(cache).toEqual(mockData.cache);
      }
    }
  };

  Query.content({}, mockData, { models });
});

it("`Query` should have a feed function", () => {
  const { Query } = Resolver;

  expect(Query.feed).toBeTruthy();
});

it("`Query` feed should call model find with vars", () => {
  const { Query } = Resolver;
  const mockData = {
    excludeChannels: [],
    limit: 1,
    skip: 2,
    status: "yep",
    cache: {
      things: "things"
    }
  };
  const models = {
    Content: {
      find: (object, cache) => {
        expect(object.channel_name).toEqual({ $or: eeChannels });
        expect(object.offset).toEqual(mockData.skip);
        expect(object.limit).toEqual(mockData.limit);
        expect(object.status).toEqual(mockData.status);
      }
    }
  };

  Query.feed({}, mockData, { models });
});

it("`Query` feed should lower case and exclude channels passed in", () => {
  const { Query } = Resolver;
  const mockData = {
    excludeChannels: ["Devotionals"],
    limit: 1,
    skip: 2,
    status: "yep",
    cache: {
      things: "things"
    }
  };
  const models = {
    Content: {
      find: (object, cache) => {
        expect(object.channel_name).toEqual({
          $or: difference(eeChannels, ["devotionals"])
        });
      }
    }
  };

  Query.feed({}, mockData, { models });
});

it("`Query` feed should lower case, convert, and exclude Series and Music", () => {
  const { Query } = Resolver;
  const mockData = {
    excludeChannels: ["Series", "Music"],
    limit: 1,
    skip: 2,
    status: "yep",
    cache: {
      things: "things"
    }
  };
  const models = {
    Content: {
      find: (object, cache) => {
        expect(object.channel_name).toEqual({
          $or: difference(eeChannels, ["series_newspring", "newspring_albums"])
        });
      }
    }
  };

  Query.feed({}, mockData, { models });
});

it("`Query` should have taggedContent function", () => {
  const { Query } = Resolver;

  expect(Query.taggedContent).toBeTruthy();
});

it("`Query` taggedContent should return null if no tag info", () => {
  const { Query } = Resolver;
  const mockData = {
    includeChannels: [],
    tagName: null,
    tags: null,
    limit: 1,
    skip: 2,
    cache: {
      things: "things"
    },
    excludedIds: [3]
  };
  const models = {};

  const result = Query.taggedContent({}, mockData, { models });

  expect(result).toBeFalsy();
});

it("`Query` taggedContent should call model findByTagName if tagName", () => {
  const { Query } = Resolver;
  const mockData = {
    includeChannels: ["tag1"],
    tagName: "tagggggggggg",
    tags: null,
    limit: 1,
    skip: 2,
    cache: {
      things: "things"
    },
    excludedIds: [3]
  };
  const models = {
    Content: {
      findByTagName: (params, options, cache) => {
        expect(params.tagName).toEqual(mockData.tagName);
        expect(params.includeChannels).toEqual(mockData.includeChannels);
        expect(options.offset).toEqual(mockData.skip);
        expect(options.limit).toEqual(mockData.limit);
        expect(cache).toEqual(mockData.cache);
      }
    }
  };

  Query.taggedContent({}, mockData, { models });
});

it("`Query` taggedContent should call modal findByTags if tags", () => {
  const { Query } = Resolver;
  const mockData = {
    includeChannels: ["tag1"],
    tagName: null,
    tags: ["tag2", "tag3", "tag4"],
    limit: 1,
    skip: 2,
    cache: {
      things: "things"
    },
    excludedIds: [3]
  };
  const models = {
    Content: {
      findByTags: (params, options, cache) => {
        expect(params.tags).toEqual(mockData.tags);
        expect(params.includeChannels).toEqual(mockData.includeChannels);
        expect(params.excludedIds).toEqual(mockData.excludedIds);
        expect(options.offset).toEqual(mockData.skip);
        expect(options.limit).toEqual(mockData.limit);
        expect(cache).toEqual(mockData.cache);
      }
    }
  };

  Query.taggedContent({}, mockData, { models });
});

it("`Query` lowReorderSets should exist", () => {
  const { Query } = Resolver;

  expect(Query.lowReorderSets).toBeTruthy();
});

it("`Query` lowReorderSets should call model function with vars", () => {
  const { Query } = Resolver;
  const mockData = {
    setName: "nav"
  };
  const models = {
    Content: {
      getFromLowReorderSet: setName => {
        expect(setName).toEqual(mockData.setName);
      }
    }
  };

  Query.lowReorderSets({}, mockData, { models });
});

it("`Query` live should exist", () => {
  const { Query } = Resolver;

  expect(Query.live).toBeTruthy();
});

it("`Query` live should call model", () => {
  const { Query } = Resolver;
  const models = {
    Content: {
      getLiveStream: () => {
        expect(true).toBeTruthy();
      }
    }
  };

  Query.live({}, {}, { models });
});

it("`Query` contentWithUrlTitle should exist", () => {
  const { Query } = Resolver;
  expect(Query.contentWithUrlTitle).toBeTruthy();
});

it("`Query` contentWithUrlTitle should call model", () => {
  const { Query } = Resolver;
  const models = {
    Content: {
      findByUrlTitle: () => {
        expect(true).toBeTruthy();
      }
    }
  };

  Query.contentWithUrlTitle({}, {}, { models });
});

it("`LiveFeed` should return the live flag", () => {
  const { LiveFeed } = Resolver;

  const isLive = LiveFeed.live(sampleData.live);

  expect(isLive).toEqual(sampleData.live.isLive);
});

it("`ContentColor` returns the color id", () => {
  const { ContentColor } = Resolver;

  const id = ContentColor.id(sampleData.contentColor);

  expect(id).toEqual(sampleData.contentColor.id);
});

it("`ContentColor` returns the color value", () => {
  const { ContentColor } = Resolver;

  const value = ContentColor.value(sampleData.contentColor);

  expect(value).toEqual(sampleData.contentColor.value);
});

it("`ContentColor` returns the color description", () => {
  const { ContentColor } = Resolver;

  const description = ContentColor.description(sampleData.contentColor);

  expect(description).toEqual(sampleData.contentColor.description);
});

it("`ContentScripture` returns book", () => {
  const { ContentScripture } = Resolver;

  const book = ContentScripture.book(sampleData.contentScripture);

  expect(book).toEqual(sampleData.contentScripture.book);
});

it("`ContentScripture` returns the passage", () => {
  const { ContentScripture } = Resolver;

  const passage = ContentScripture.passage(sampleData.contentScripture);

  expect(passage).toEqual(sampleData.contentScripture.passage);
});

it("`ContentData` should call cleanMarkup with body", () => {
  const { ContentData } = Resolver;
  const mockData = {
    body: "test",
    legacy_body: null
  };
  const models = {
    Content: {
      cleanMarkup: markup => {
        expect(markup).toEqual(mockData.body);
      }
    }
  };

  ContentData.body(mockData, {}, { models });
});

it("`ContentData` should call cleanMarkup with legacy_body if no body", () => {
  const { ContentData } = Resolver;
  const mockData = {
    body: null,
    legacy_body: "test"
  };
  const models = {
    Content: {
      cleanMarkup: markup => {
        expect(markup).toEqual(mockData.legacy_body);
      }
    }
  };

  ContentData.body(mockData, {}, { models });
});

it("`ContentData` should return description", () => {
  const { ContentData } = Resolver;
  const mockData = {
    description: "description"
  };

  const description = ContentData.description(mockData);
  expect(description).toEqual(mockData.description);
});

it("`ContentData` should return wistiaId", () => {
  const { ContentData } = Resolver;
  const mockData = {
    video: "id"
  };

  const wistiaId = ContentData.wistiaId(mockData);
  expect(wistiaId).toEqual(mockData.video);
});

it("`ContentData` should return a video", () => {
  const { ContentData } = Resolver;
  const mockData = {
    video: "id"
  };

  const mockModels = {
    Content: {
      getContentVideo: jest.fn()
    }
  };

  const video = ContentData.video(mockData, undefined, { models: mockModels });

  expect(video).toMatchObject({
    hashed_id: mockData.video
  });
});

it("`ContentData` should call splitByNewLines", () => {
  const { ContentData } = Resolver;
  const mockData = {
    tags: "tags"
  };
  const models = {
    Content: {
      splitByNewLines: tags => {
        expect(tags).toEqual(mockData.tags);
      }
    }
  };

  ContentData.tags(mockData, {}, { models });
});

it("`ContentData` should return speaker", () => {
  const { ContentData } = Resolver;
  const mockData = {
    speaker: "speaker"
  };

  const speaker = ContentData.speaker(mockData);
  expect(speaker).toEqual(mockData.speaker);
});

it("`ContentData` should return hashtag", () => {
  const { ContentData } = Resolver;
  const mockData = {
    hashtag: "hashtag"
  };

  const hashtag = ContentData.hashtag(mockData);
  expect(hashtag).toEqual(mockData.hashtag);
});

it("`ContentData` should return foreground_color not dark", () => {
  const { ContentData } = Resolver;
  const mockData = {
    lightswitch: null,
    foreground_color: "dark"
  };

  const isLight = ContentData.isLight(mockData);
  expect(isLight).toEqual(mockData.foreground_color !== "dark");
});

it("`ContentData` should return lightswitch not dark for isLight if no foreground_color", () => {
  const { ContentData } = Resolver;
  const mockData = {
    lightswitch: "dark",
    foreground_color: null
  };

  const isLight = ContentData.isLight(mockData);
  expect(isLight).toEqual(mockData.lightswitch !== "dark");
});

it("`ContentData` should return blank array if no scripture", () => {
  const { ContentData } = Resolver;
  const mockData = {
    entry_id: "1",
    scripture: null,
    exp_channel: {}
  };
  const models = {};

  const scripture = ContentData.scripture(mockData, {}, { models });
  expect(scripture).toEqual([]);
});

it("`ContentData` should call getContentFromMatrix with position if scripture", () => {
  const { ContentData } = Resolver;
  const mockData = {
    entry_id: "1",
    scripture: "scripture",
    exp_channel: {
      exp_channel_fields: {
        scripture: "field_id_345"
      }
    }
  };
  const models = {
    Content: {
      getContentFromMatrix: (entry_id, scripture, position) => {
        expect(entry_id).toEqual(mockData.entry_id);
        expect(scripture).toEqual(mockData.scripture);
        expect(position).toEqual(345);
      }
    }
  };

  ContentData.scripture(mockData, {}, { models });
});

it("`ContentData` should return blank array if no bgcolor and no color", () => {
  const { ContentData } = Resolver;
  const mockData = {
    bgcolor: null,
    fgcolor: null,
    color: null
  };

  const colors = ContentData.colors(mockData);
  expect(colors).toEqual([]);
});

it("`ContentData` should return color and primary if color", () => {
  const { ContentData } = Resolver;
  const mockData = {
    bgcolor: null,
    fgcolor: null,
    color: "green"
  };

  const colors = ContentData.colors(mockData);
  expect(colors).toEqual([
    {
      value: mockData.color,
      description: "primary"
    }
  ]);
});

it("`ContentData` should prioritize fgcolor over bgcolor", () => {
  const { ContentData } = Resolver;
  const mockData = {
    bgcolor: "blue",
    fgcolor: "orange",
    color: null
  };

  const colors = ContentData.colors(mockData);
  expect(colors).toEqual([
    {
      value: mockData.fgcolor,
      description: "primary"
    }
  ]);
});

it("`ContentData` should return bgcolor and primary if no color", () => {
  const { ContentData } = Resolver;
  const mockData = {
    bgcolor: "red",
    fgcolor: null,
    color: null
  };

  const colors = ContentData.colors(mockData);
  expect(colors).toEqual([
    {
      value: mockData.bgcolor,
      description: "primary"
    }
  ]);
});

it("`ContentData` returns blank array if no audio or tracks", async () => {
  const { ContentData } = Resolver;
  const mockData = {
    entry_id: "testId",
    audio: null,
    tracks: null,
    exp_channel: {},
    audio_duration: null
  };
  const models = {};

  await ContentData.audio(mockData, null, { models });
});

it("`ContentData` fetches audio files if audio", async () => {
  const { ContentData } = Resolver;
  const mockData = {
    entry_id: "testId",
    audio: "audio.mp3",
    tracks: null,
    exp_channel: {
      exp_channel_fields: {
        audio: "test_field_123"
      }
    },
    audio_duration: "1:23"
  };
  const models = {
    File: {
      getFilesFromContent: (entry_id, audio, audioPosition, duration) => {
        expect(entry_id).toEqual(mockData.entry_id);
        expect(audio).toEqual(mockData.audio);
        expect(audioPosition).toEqual(
          Number(mockData.exp_channel.exp_channel_fields.audio.split("_").pop())
        );
        expect(duration).toEqual(mockData.audio_duration);
      }
    }
  };

  await ContentData.audio(mockData, null, { models });
});

it("`ContentData` fetches tracks files if tracks", async () => {
  const { ContentData } = Resolver;
  const mockData = {
    entry_id: "testId",
    audio: null,
    tracks: "audio.mp3",
    exp_channel: {
      exp_channel_fields: {
        tracks: "test_field_789"
      }
    },
    audio_duration: null
  };
  const models = {
    File: {
      getFilesFromContent: (entry_id, tracks, trackPosition) => {
        expect(entry_id).toEqual(mockData.entry_id);
        expect(tracks).toEqual(mockData.tracks);
        expect(trackPosition).toEqual(
          Number(
            mockData.exp_channel.exp_channel_fields.tracks.split("_").pop()
          )
        );
      }
    }
  };

  await ContentData.audio(mockData, null, { models });
});

it("`ContentData` fetches audio and tracks files if both", async () => {
  const { ContentData } = Resolver;
  const mockData = {
    entry_id: "testId",
    audio: "audio.mp3",
    tracks: "track.mp3",
    exp_channel: {
      exp_channel_fields: {
        audio: "test_field_123",
        tracks: "test_field_789"
      }
    },
    audio_duration: "1:23"
  };
  let count = 0;
  const models = {
    File: {
      getFilesFromContent: (entry_id, thing, thingPosition, duration) => {
        count++;
        expect(entry_id).toEqual(mockData.entry_id);
        expect(
          [mockData.audio, mockData.tracks].indexOf(thing) > -1
        ).toBeTruthy();
        const splitField =
          thing === mockData.audio
            ? Number(
                mockData.exp_channel.exp_channel_fields.audio.split("_").pop()
              )
            : Number(
                mockData.exp_channel.exp_channel_fields.tracks.split("_").pop()
              );
        expect(thingPosition).toEqual(splitField);
        if (thing === mockData.audio) {
          expect(duration).toEqual(mockData.audio_duration);
        }
      }
    }
  };

  await ContentData.audio(mockData, null, { models });
  expect(count).toEqual(2);
});

it("`ContentData` returns blank array if no image or blurred image", async () => {
  const { ContentData } = Resolver;
  const mockData = {
    image: null,
    image_blurred: null,
    exp_channel: {},
    entry_id: 1
  };
  const mockParams = {
    sizes: null,
    ratios: null
  };
  const models = {};

  const result = await ContentData.images(mockData, mockParams, { models });
  expect(result).toEqual([]);
});

it("`ContentData` calls model with image position when image", async () => {
  const { ContentData } = Resolver;
  const mockData = {
    image: "test.jpg",
    image_blurred: null,
    exp_channel: {
      exp_channel_fields: {
        image: "test_field_123"
      }
    },
    entry_id: 1
  };
  const mockParams = {
    sizes: null,
    ratios: null
  };
  const models = {
    File: {
      getFilesFromContent: (entry_id, thing, position) => {
        expect(entry_id).toEqual(mockData.entry_id);
        expect(thing).toEqual(mockData.image);
        const splitField = Number(
          mockData.exp_channel.exp_channel_fields.image.split("_").pop()
        );
        expect(position).toEqual(splitField);
      }
    }
  };

  await ContentData.images(mockData, mockParams, { models });
});

it("`ContentData` calls model with blurred image position when blurred image", async () => {
  const { ContentData } = Resolver;
  const mockData = {
    image: null,
    image_blurred: "blurry.jpg",
    exp_channel: {
      exp_channel_fields: {
        image_blurred: "test_field_789"
      }
    },
    entry_id: 2
  };
  const mockParams = {
    sizes: null,
    ratios: null
  };
  const models = {
    File: {
      getFilesFromContent: (entry_id, thing, position) => {
        expect(entry_id).toEqual(mockData.entry_id);
        expect(thing).toEqual(mockData.image_blurred);
        const splitField = Number(
          mockData.exp_channel.exp_channel_fields.image_blurred.split("_").pop()
        );
        expect(position).toEqual(splitField);
      }
    }
  };

  await ContentData.images(mockData, mockParams, { models });
});

it("`ContentData` calls model twice if both image and blurred image", async () => {
  const { ContentData } = Resolver;
  const mockData = {
    image: "image.jpg",
    image_blurred: "blurry.jpg",
    exp_channel: {
      exp_channel_fields: {
        image: "test_field_234",
        image_blurred: "test_field_678"
      }
    },
    entry_id: 3
  };
  const mockParams = {
    sizes: null,
    ratios: null
  };
  let count = 0;
  const models = {
    File: {
      getFilesFromContent: (entry_id, thing, position) => {
        count++;
        expect(entry_id).toEqual(mockData.entry_id);
        expect(
          [mockData.image, mockData.image_blurred].indexOf(thing) > -1
        ).toBeTruthy();
        const splitField =
          thing === mockData.image
            ? Number(
                mockData.exp_channel.exp_channel_fields.image.split("_").pop()
              )
            : Number(
                mockData.exp_channel.exp_channel_fields.image_blurred
                  .split("_")
                  .pop()
              );
        expect(position).toEqual(splitField);
      }
    }
  };

  await ContentData.images(mockData, mockParams, { models });
  expect(count).toEqual(2);
});

it("`ContentData` returns 5 resized images if image", async () => {
  const { ContentData } = Resolver;
  const mockData = {
    image: "image.jpg",
    image_blurred: null,
    exp_channel: {
      exp_channel_fields: {
        image: "test_field_123"
      }
    },
    entry_id: 1
  };
  const mockParams = {
    sizes: null,
    ratios: null
  };
  const models = {
    File: {
      getFilesFromContent: (entry_id, thing, position) =>
        Promise.resolve([
          {
            url: "url.jpg"
          }
        ])
    }
  };

  const result = await ContentData.images(mockData, mockParams, { models });
  expect(result.length).toEqual(5);
});

it("`ContentData` returns 10 resized images if image and blurred image", async () => {
  const { ContentData } = Resolver;
  const mockData = {
    image: "image.jpg",
    image_blurred: "blurry.jpg",
    exp_channel: {
      exp_channel_fields: {
        image: "test_field_123",
        image_blurred: "test_field_789"
      }
    },
    entry_id: 1
  };
  const mockParams = {
    sizes: null,
    ratios: null
  };
  const models = {
    File: {
      getFilesFromContent: (entry_id, thing, position) =>
        Promise.resolve([
          {
            url: "url.jpg"
          }
        ])
    }
  };

  const result = await ContentData.images(mockData, mockParams, { models });
  expect(result.length).toEqual(10);
});

it("`ContentData` returns only image size specified", async () => {
  const { ContentData } = Resolver;
  const mockData = {
    image: "image.jpg",
    image_blurred: null,
    exp_channel: {
      exp_channel_fields: {
        image: "test_field_123"
      }
    },
    entry_id: 1
  };
  const mockParams = {
    sizes: ["small"],
    ratios: null
  };
  const models = {
    File: {
      getFilesFromContent: (entry_id, thing, position) =>
        Promise.resolve([
          {
            url: "url.jpg"
          }
        ])
    }
  };

  const result = await ContentData.images(mockData, mockParams, { models });
  expect(result.length).toEqual(1);
  expect(result[0].url.indexOf("small") > -1).toBeTruthy();
  expect(result[0].size).toEqual("small");
});

it("`ContentData` returns only ratio specified", async () => {
  const { ContentData } = Resolver;
  const mockData = {
    image: "image.jpg",
    image_blurred: null,
    exp_channel: {
      exp_channel_fields: {
        image: "test_field_123"
      }
    },
    entry_id: 1
  };
  const mockParams = {
    sizes: null,
    ratios: ["2:1"]
  };
  const models = {
    File: {
      getFilesFromContent: (entry_id, thing, position) =>
        Promise.resolve([
          {
            url: "url.jpg",
            fileLabel: "1:2"
          },
          {
            url: "url.jpg",
            fileLabel: "2:1"
          }
        ])
    }
  };

  const result = await ContentData.images(mockData, mockParams, { models });
  expect(result.length).toEqual(5);
  result.map(image => {
    expect(image.fileLabel).toEqual("2:1");
  });
});

it("`ContentMeta` should exist", () => {
  const { ContentMeta } = Resolver;
  expect(ContentMeta).toBeTruthy();
});

it("`ContentMeta` should return global id of site_id", () => {
  const { ContentMeta } = Resolver;
  const mockData = {
    site_id: "1"
  };

  const site = ContentMeta.site(mockData);
  expect(site).toEqual(createGlobalId(mockData.site_id, "Sites"));
});

it("`ContentMeta` should return global id of channel_id", () => {
  const { ContentMeta } = Resolver;
  const mockData = {
    channel_id: "2"
  };

  const channel = ContentMeta.channel(mockData);
  expect(channel).toEqual(createGlobalId(mockData.channel_id, "Channel"));
});

it("`ContentMeta` should return global id of series_id", () => {
  const { ContentMeta } = Resolver;
  const mockData = {
    series_id: "3"
  };
  const parentType = {
    name: "suchparent"
  };

  const series = ContentMeta.series(mockData, {}, {}, { parentType });
  expect(series).toEqual(createGlobalId(mockData.series_id, parentType.name));
});

it("`ContentMeta` should return url for urlTitle", () => {
  const { ContentMeta } = Resolver;
  const mockData = {
    url: "url",
    exp_channel_title: {
      url_title: "title"
    }
  };

  const urlTitle = ContentMeta.urlTitle(mockData);
  expect(urlTitle).toEqual(mockData.url);
});

it("`ContentMeta` should return false if no url and no exp_channel_title", () => {
  const { ContentMeta } = Resolver;
  const mockData = {
    url: null,
    exp_channel_title: null
  };

  const urlTitle = ContentMeta.urlTitle(mockData);
  expect(urlTitle).toBeFalsy();
});

it("`ContentMeta` should return false if no url and no url_title", () => {
  const { ContentMeta } = Resolver;
  const mockData = {
    url: null,
    exp_channel_title: {
      url_title: null
    }
  };

  const urlTitle = ContentMeta.urlTitle(mockData);
  expect(urlTitle).toBeFalsy();
});

it("`ContentMeta` should return url_title if no url", () => {
  const { ContentMeta } = Resolver;
  const mockData = {
    url: null,
    exp_channel_title: {
      url_title: "meow"
    }
  };

  const urlTitle = ContentMeta.urlTitle(mockData);
  expect(urlTitle).toEqual(mockData.exp_channel_title.url_title);
});

it("`ContentMeta` should return summary if summary", async () => {
  const { ContentMeta } = Resolver;
  const mockData = {
    summary: "summary",
    body: null,
    legacy_body: null
  };
  const models = {};

  const summary = await ContentMeta.summary(mockData, {}, { models });
  expect(summary).toEqual(mockData.summary);
});

it("`ContentMeta` should call cleanMarkup with body if no summary", async () => {
  const { ContentMeta } = Resolver;
  const mockData = {
    summary: null,
    body: "body",
    legacy_body: "legacy_body"
  };
  const models = {
    Content: {
      cleanMarkup: markup => {
        expect(markup).toEqual(mockData.body);
      }
    }
  };

  await ContentMeta.summary(mockData, {}, { models });
});

it("`ContentMeta` should call cleanMarkup with legacy_body if no summary or body", async () => {
  const { ContentMeta } = Resolver;
  const mockData = {
    summary: null,
    body: null,
    legacy_body: "legacy_body"
  };
  const models = {
    Content: {
      cleanMarkup: markup => {
        expect(markup).toEqual(mockData.legacy_body);
      }
    }
  };

  await ContentMeta.summary(mockData, {}, { models });
});

it("`ContentMeta` should null if no body, legacy_body, or summary", async () => {
  const { ContentMeta } = Resolver;
  const mockData = {
    summary: null,
    body: null,
    legacy_body: null
  };
  const models = {
    Content: {
      cleanMarkup: markup => null
    }
  };

  const summary = await ContentMeta.summary(mockData, {}, { models });
  expect(summary).toEqual(null);
});

it("`ContentMeta` date should call getData on model", () => {
  const { ContentMeta } = Resolver;
  const mockData = {
    exp_channel_title: {
      day: "day",
      month: "month",
      year: "year"
    }
  };
  const models = {
    Content: {
      getDate: (day, month, year) => {
        expect(day).toEqual(mockData.exp_channel_title.day);
        expect(month).toEqual(mockData.exp_channel_title.month);
        expect(year).toEqual(mockData.exp_channel_title.year);
      }
    }
  };

  ContentMeta.date(mockData, {}, { models });
});

it("`ContentMeta` actualDate should call getDateFromUnix", () => {
  const { ContentMeta } = Resolver;
  const mockData = {
    actualdate: "date"
  };
  const models = {
    Content: {
      getDateFromUnix: actualDate => {
        expect(actualDate).toEqual(mockData.actualdate);
      }
    }
  };

  ContentMeta.actualDate(mockData, {}, { models });
});

it("`ContentMeta` entryDate should call getDateFromUnix", () => {
  const { ContentMeta } = Resolver;
  const mockData = {
    entrydate: "date"
  };
  const models = {
    Content: {
      getDateFromUnix: entryDate => {
        expect(entryDate).toEqual(mockData.entrydate);
      }
    }
  };

  ContentMeta.entryDate(mockData, {}, { models });
});

it("`ContentMeta` startDate should call getDateFromUnix", () => {
  const { ContentMeta } = Resolver;
  const mockData = {
    startdate: "date"
  };
  const models = {
    Content: {
      getDateFromUnix: startDate => {
        expect(startDate).toEqual(mockData.startdate);
      }
    }
  };

  ContentMeta.startDate(mockData, {}, { models });
});

it("`ContentMeta` endDate should call getDateFromUnix", () => {
  const { ContentMeta } = Resolver;
  const mockData = {
    enddate: "date"
  };
  const models = {
    Content: {
      getDateFromUnix: endDate => {
        expect(endDate).toEqual(mockData.enddate);
      }
    }
  };

  ContentMeta.endDate(mockData, {}, { models });
});

it("`Content` should exist", () => {
  const { Content } = Resolver;
  expect(Content).toBeTruthy();
});

it("`Content` should return global id for id", () => {
  const { Content } = Resolver;
  const mockData = {
    entry_id: "1"
  };
  const parentType = {
    name: "parent"
  };

  const id = Content.id(mockData, {}, {}, { parentType });
  expect(id).toEqual(createGlobalId(mockData.entry_id, parentType.name));
});

it("`Content` should return global id for channel", () => {
  const { Content } = Resolver;
  const mockData = {
    channel_id: "1"
  };

  const channel = Content.channel(mockData);
  expect(channel).toEqual(createGlobalId(mockData.channel_id, "Channel"));
});

it("`Content` channelName should return channel name", () => {
  const { Content } = Resolver;
  const mockData = {
    exp_channel: {
      channel_name: "channel"
    }
  };

  const channelName = Content.channelName(mockData);
  expect(channelName).toEqual(mockData.exp_channel.channel_name);
});

it("`Content` campus should call campus.find", async () => {
  const { Content } = Resolver;
  const mockData = { campus: "[1234] [harambe] Clemson" };
  const mockModels = {
    models: { Campus: { find: jest.fn(() => Promise.resolve([])) } }
  };

  const campus = await Content.campus(mockData, null, mockModels);
  expect(mockModels.models.Campus.find).toHaveBeenCalledWith({
    Name: "Clemson"
  });
});

it("`Content` campus should return the correct campus", async () => {
  const { Content } = Resolver;
  const mockData = { campus: "[1234] [harambe] Clemson" };
  const mockModels = {
    models: {
      Campus: {
        find: jest.fn(() => Promise.resolve(["cincinnati", "zoo"]))
      }
    }
  };

  const campus = await Content.campus(mockData, null, mockModels);
  expect(campus).toEqual("cincinnati");
});

it("`Content` title should return title", () => {
  const { Content } = Resolver;
  const mockData = {
    exp_channel_title: {
      title: "title"
    }
  };

  const title = Content.title(mockData);
  expect(title).toEqual(mockData.exp_channel_title.title);
});

it("`Content` status should return status", () => {
  const { Content } = Resolver;
  const mockData = {
    exp_channel_title: {
      status: "status"
    }
  };

  const status = Content.status(mockData);
  expect(status).toEqual(mockData.exp_channel_title.status);
});

it("`Content` parent should call findByChildId", () => {
  const { Content } = Resolver;
  const mockData = {
    entry_id: "1"
  };
  const models = {
    Content: {
      findByChildId: entry_id => {
        expect(entry_id).toEqual(mockData.entry_id);
      }
    }
  };

  Content.parent(mockData, {}, { models });
});

it("`Content` meta should just return the data", () => {
  const { Content } = Resolver;
  const mockData = {
    thing1: "thing1",
    thing2: "thing2"
  };

  const meta = Content.meta(mockData);
  expect(meta).toEqual(mockData);
});

it("`Content` content should just return the data", () => {
  const { Content } = Resolver;
  const mockData = {
    thing3: "thing3",
    thing4: "thing4"
  };

  const content = Content.content(mockData);
  expect(content).toEqual(mockData);
});

it("`Content` authors should return null if no authors", () => {
  const { Content } = Resolver;
  const mockData = {
    editorial_authors: null,
    author: null
  };

  const authors = Content.authors(mockData);
  expect(authors).toEqual(null);
});

it("`Content` authors should return an array of authors", () => {
  const { Content } = Resolver;
  const mockData = {
    editorial_authors: "me,you,i",
    author: null
  };

  const authors = Content.authors(mockData);
  expect(authors).toEqual(["me", "you", "i"]);
});

it("`Content` authors should prioritize author", () => {
  const { Content } = Resolver;
  const mockData = {
    editorial_authors: "me,you,i",
    author: "me,you,we"
  };

  const authors = Content.authors(mockData);
  expect(authors).toEqual(["me", "you", "we"]);
});

it("`Content` children should call findByParentId", () => {
  const { Content } = Resolver;
  const mockData = {
    entry_id: "1"
  };
  const mockInput = {
    channels: ["channel1", "channel2"]
  };
  const models = {
    Content: {
      findByParentId: (entry_id, channels) => {
        expect(entry_id).toEqual(mockData.entry_id);
        expect(channels).toEqual(mockInput.channels);
        return Promise.resolve([]);
      }
    }
  };

  Content.children(mockData, mockInput, { models });
});

it("`Content` should sort children by entry date", async () => {
  const { Content } = Resolver;
  const mockData = {
    entry_id: "1"
  };
  const mockInput = {
    channels: ["channel1", "channel2"]
  };
  const mockResults = [
    { title: "third", exp_channel_title: { entry_date: 3 } },
    { title: "second", exp_channel_title: { entry_date: 2 } },
    { title: "first", exp_channel_title: { entry_date: 1 } }
  ];
  const models = {
    Content: {
      findByParentId: (entry_id, channels) => {
        expect(entry_id).toEqual(mockData.entry_id);
        expect(channels).toEqual(mockInput.channels);
        return Promise.resolve(mockResults);
      }
    }
  };

  const res = await Content.children(mockData, mockInput, { models });
  expect(res[0].title).toEqual("first");
  expect(res[1].title).toEqual("second");
  expect(res[2].title).toEqual("third");
});

it("`Content` related call splitByNewLines", () => {
  const { Content } = Resolver;
  const mockData = {
    tags: "meow\nwoof\ncool"
  };
  const mockInput = {
    includeChannels: null,
    limit: null,
    skip: null,
    cache: null
  };
  const models = {
    Content: {
      splitByNewLines: tags => {
        expect(tags).toEqual(mockData.tags);
      }
    }
  };

  Content.related(mockData, mockInput, { models });
});

it("`Content` related should return null if tags falsy", () => {
  const { Content } = Resolver;
  const mockData = {
    tags: null
  };
  const mockInput = {
    includeChannels: null,
    limit: null,
    skip: null,
    cache: null
  };
  const models = {
    Content: {
      splitByNewLines: () => null
    }
  };

  const related = Content.related(mockData, mockInput, { models });
  expect(related).toEqual(null);
});

it("`Content` related should return null if tags is empty array", () => {
  const { Content } = Resolver;
  const mockData = {
    tags: null
  };
  const mockInput = {
    includeChannels: null,
    limit: null,
    skip: null,
    cache: null
  };
  const models = {
    Content: {
      splitByNewLines: () => []
    }
  };

  const related = Content.related(mockData, mockInput, { models });
  expect(related).toEqual(null);
});

it("`Content` related should call findByTags if tags", () => {
  const { Content } = Resolver;
  const mockData = {
    tags: "meow\nwoof\ncool"
  };
  const splitTags = ["meow", "woof", "cool"];
  const mockInput = {
    includeChannels: ["one", "two"],
    limit: 1,
    skip: 2,
    cache: true
  };
  const models = {
    Content: {
      splitByNewLines: () => splitTags,
      findByTags: (inputs, options, cache) => {
        expect(inputs.tags).toEqual(splitTags);
        expect(inputs.includeChannels).toEqual(mockInput.includeChannels);
        expect(options.offset).toEqual(mockInput.skip);
        expect(options.limit).toEqual(mockInput.limit);
        expect(cache).toEqual(mockInput.cache);
      }
    }
  };

  Content.related(mockData, mockInput, { models });
});

it("`Content` seriesId should return global id", () => {
  const { Content } = Resolver;
  const mockData = {
    series_id: "2"
  };
  const parentType = {
    name: "parent"
  };

  const seriesId = Content.seriesId(mockData, {}, {}, { parentType });
  expect(seriesId).toEqual(createGlobalId(mockData.series_id, parentType.name));
});
