import test from "ava";
import casual from "casual";
import Resolver from "../../../../src/esv/models/scripture/resolver";

const sampleData = casual.description;

test("`Query` exposes scripture function", t => {
  const { Query } = Resolver;
  t.truthy(Query.scripture);
});

test("`ESVScripture` returns html from data", t => {
  const { ESVScripture } = Resolver;
  const html = ESVScripture.html(sampleData);
  t.is(html, sampleData);
});
