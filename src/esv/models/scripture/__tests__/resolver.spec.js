import casual from "casual";
import Resolver from "../resolver";

const sampleData = casual.description;

it("`Query` exposes scripture function", () => {
  const { Query } = Resolver;
  expect(Query.scripture).toBeTruthy();
});

it("`ESVScripture` returns html from data", () => {
  const { ESVScripture } = Resolver;
  const html = ESVScripture.html(sampleData);
  expect(html).toEqual(sampleData);
});
