
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