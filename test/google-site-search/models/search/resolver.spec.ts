import test from "ava";
import casual from "casual";
import Resolver from "../../../../src/google-site-search/models/search/resolver";

const generateSearchItem = () => {
  return {
    cacheId: casual.word,
    title: `${casual.word}|${casual.word}`,
    htmlTitle: `${casual.word}|${casual.word}`,
    link: casual.url,
    displayLink: casual.url,
    snippet: casual.description,
    htmlSnippet: casual.description,
    pagemap: {
      metatags: [
        {
          "og:type": casual.word,
          "article:section": casual.word,
        },
      ],
      cse_image: [
        {
          src: casual.url,
        },
      ],
    },
    type: casual.word,
    section: casual.word,
    image: casual.url,
  };
};

const generateSearch = (items = []) => {
  return {
    total: 2,
    next: 3,
    previous: 0,
    items,
  };
};

test("`Query` should expose search method", t => {
  const { Query } = Resolver;
  t.truthy(Query.search);
});

test("`SSSearchResult` should return the id from the search result", t => {
  const { SSSearchResult } = Resolver;
  const sampleItem = generateSearchItem();

  const id = SSSearchResult.id(sampleItem);
  t.is(id, sampleItem.cacheId);
});

test("`SSSearchResult` should return the title from the search result", t => {
  const { SSSearchResult } = Resolver;
  const sampleItem = generateSearchItem();

  const title = SSSearchResult.title(sampleItem);
  t.is(title, sampleItem.title.split("|")[0].trim());
});

test("`SSSearchResult` should return the htmlTitle from the search result", t => {
  const { SSSearchResult } = Resolver;
  const sampleItem = generateSearchItem();

  const htmlTitle = SSSearchResult.htmlTitle(sampleItem);
  t.is(htmlTitle, sampleItem.htmlTitle.split("|")[0].trim());
});

test("`SSSearchResult` should return the link from the search result", t => {
  const { SSSearchResult } = Resolver;
  const sampleItem = generateSearchItem();

  const link = SSSearchResult.link(sampleItem);
  t.is(link, sampleItem.link);
});

test("`SSSearchResult` should return the displayLink from the search result", t => {
  const { SSSearchResult } = Resolver;
  const sampleItem = generateSearchItem();

  const displayLink = SSSearchResult.displayLink(sampleItem);
  t.is(displayLink, sampleItem.displayLink);
});

test("`SSSearchResult` should return the description from the search result", t => {
  const { SSSearchResult } = Resolver;
  const sampleItem = generateSearchItem();

  const description = SSSearchResult.description(sampleItem);
  t.is(description, sampleItem.snippet);
});

test("`SSSearchResult` should return the htmlDescription from the search result", t => {
  const { SSSearchResult } = Resolver;
  const sampleItem = generateSearchItem();

  const htmlDescription = SSSearchResult.htmlDescription(sampleItem);
  t.is(htmlDescription, sampleItem.htmlSnippet);
});

test("`SSSearchResult` should return null for type if no pagemap in result", t => {
  const { SSSearchResult } = Resolver;
  const sampleItem = generateSearchItem();
  delete sampleItem.pagemap;

  const resultType = SSSearchResult.type(sampleItem);
  t.is(resultType, null);
});

test("`SSSearchResult` should return null for type if no metatags in pagemap in result", t => {
  const { SSSearchResult } = Resolver;
  const sampleItem = generateSearchItem();
  delete sampleItem.pagemap.metatags;

  const resultType = SSSearchResult.type(sampleItem);
  t.is(resultType, null);
});

test("`SSSearchResult` should return the type of the search result", t => {
  const { SSSearchResult } = Resolver;
  const sampleItem = generateSearchItem();

  const resultType = SSSearchResult.type(sampleItem);
  t.is(resultType, sampleItem.pagemap.metatags[0]["og:type"]);
});

test("`SSSearchResult` should return null for section if no pagemap in result", t => {
  const { SSSearchResult } = Resolver;
  const sampleItem = generateSearchItem();
  delete sampleItem.pagemap;

  const section = SSSearchResult.section(sampleItem);
  t.is(section, null);
});

test("`SSSearchResult` should return null for type if no metatags in pagemap in result", t => {
  const { SSSearchResult } = Resolver;
  const sampleItem = generateSearchItem();
  delete sampleItem.pagemap.metatags;

  const section = SSSearchResult.section(sampleItem);
  t.is(section, null);
});

test("`SSSearchResult` should return the section from the search result", t => {
  const { SSSearchResult } = Resolver;
  const sampleItem = generateSearchItem();

  const section = SSSearchResult.section(sampleItem);
  t.is(section, sampleItem.pagemap.metatags[0]["article:section"]);
});

test("`SSSearchResult` should return false if there is no image in the search result", t => {
  const { SSSearchResult } = Resolver;
  const sampleItem = generateSearchItem();
  delete sampleItem.pagemap;

  const image = SSSearchResult.image(sampleItem);
  t.falsy(image);
});

test("`SSSearchResult` should return the image from the search result", t => {
  const { SSSearchResult } = Resolver;
  const sampleItem = generateSearchItem();

  const image = SSSearchResult.image(sampleItem);
  t.is(image, sampleItem.pagemap.cse_image[0].src);
});

test("`SSSearch` should return the total", t => {
  const { SSSearch } = Resolver;
  const sampleSearch = generateSearch();

  const total = SSSearch.total(sampleSearch);
  t.is(total, sampleSearch.total);
});

test("`SSSearch` should return next", t => {
  const { SSSearch } = Resolver;
  const sampleSearch = generateSearch();

  const next = SSSearch.next(sampleSearch);
  t.is(next, sampleSearch.next);
});

test("`SSSearch` should return previous", t => {
  const { SSSearch } = Resolver;
  const sampleSearch = generateSearch();

  const previous = SSSearch.previous(sampleSearch);
  t.is(previous, sampleSearch.previous);
});

test("`SSSearch` should return items", t => {
  const { SSSearch } = Resolver;
  const sampleItems = [
    generateSearchItem(),
    generateSearchItem(),
  ];
  const sampleSearch = generateSearch(sampleItems);

  const items = SSSearch.items(sampleSearch);
  t.deepEqual(items, sampleSearch.items);
});
