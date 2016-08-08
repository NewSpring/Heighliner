
import test from "ava";
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

test("`LiveFeed` should return the live flag and the embedCode", t => {
  const { LiveFeed } = Resolver;

  const embedCode = LiveFeed.embedCode(sampleData.live);
  const isLive = LiveFeed.live(sampleData.live);

  t.deepEqual(isLive, sampleData.live.isLive);
  t.deepEqual(embedCode, sampleData.live.snippet_contents);
});

test("`ContentColor` returns id, value, and description", t => {
  const { ContentColor } = Resolver;

  const id = ContentColor.id(sampleData.contentColor);
  const value = ContentColor.value(sampleData.contentColor);
  const description = ContentColor.description(sampleData.contentColor);

  t.deepEqual(id, sampleData.contentColor.id);
  t.deepEqual(value, sampleData.contentColor.value);
  t.deepEqual(description, sampleData.contentColor.description);
});

test("`ContentScripture` returns book and passage", t => {
  const { ContentScripture } = Resolver;

  const book = ContentScripture.book(sampleData.contentScripture);
  const passage = ContentScripture.passage(sampleData.contentScripture);

  t.deepEqual(book, sampleData.contentScripture.book);
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
