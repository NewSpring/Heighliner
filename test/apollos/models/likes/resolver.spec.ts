import test from "ava";
import casual from "casual";
import Resolver from "../../../../src/apollos/models/likes/resolver";
import { parseGlobalId } from "../../../../src/util";

const sampleData = {
  _id: casual.word,
  userId: casual.word,
  entryId: casual.word,
  title: casual.title,
  image: casual.url,
  link: casual.url,
  icon: casual.word,
  category: casual.word,
  date: casual.date(),
  status: casual.word,
  dateLiked: casual.date(),
};

test("`Query` should have the likes function", t => {
  const { Query } = Resolver;
  t.truthy(Query.likes);
});

test("`Like` should return the id", t => {
  const { Like } = Resolver;
  const parentType = { name: "Like" };

  const { id } = parseGlobalId(Like.id(sampleData, null, null, { parentType }));
  t.is(id, sampleData._id);
});

test("`Like` should return the userId", t => {
  const { Like } = Resolver;

  const userId = Like.userId(sampleData);
  t.is(userId, sampleData.userId);
});

test("`Like` should return the entryId", t => {
  const { Like } = Resolver;

  const entryId = Like.entryId(sampleData);
  t.is(entryId, sampleData.entryId);
});

test("`Like` should return the title", t => {
  const { Like } = Resolver;

  const title = Like.title(sampleData);
  t.is(title, sampleData.title);
});

test("`Like` should return the image", t => {
  const { Like } = Resolver;

  const image = Like.image(sampleData);
  t.is(image, sampleData.image);
});

test("`Like` should return the icon", t => {
  const { Like } = Resolver;

  const icon = Like.icon(sampleData);
  t.is(icon, sampleData.icon);
});

test("`Like` should return the category", t => {
  const { Like } = Resolver;

  const category = Like.category(sampleData);
  t.is(category, sampleData.category);
});

test("`Like` should return the date", t => {
  const { Like } = Resolver;

  const date = Like.date(sampleData);
  t.is(date, sampleData.date);
});

test("`Like` should return the status", t => {
  const { Like } = Resolver;

  const status = Like.status(sampleData);
  t.is(status, sampleData.status);
});

test("`Like` should return the dateLiked", t => {
  const { Like } = Resolver;

  const dateLiked = Like.dateLiked(sampleData);
  t.is(dateLiked, sampleData.dateLiked);
});
