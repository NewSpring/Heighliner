import casual from "casual";
import Resolver from "../resolver";

const generateSearchItem = () =>
   ({
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
   })
;

const generateSearch = (items = []) =>
   ({
     total: 2,
     next: 3,
     previous: 0,
     items,
   })
;

it("`Query` should expose search method", () => {
  const { Query } = Resolver;
  expect(Query.search).toBeTruthy();
});

it("`SSSearchResult` should return the id from the search result", () => {
  const { SSSearchResult } = Resolver;
  const sampleItem = generateSearchItem();

  const id = SSSearchResult.id(sampleItem);
  expect(id).toEqual(sampleItem.cacheId);
});

it("`SSSearchResult` should return the title from the search result", () => {
  const { SSSearchResult } = Resolver;
  const sampleItem = generateSearchItem();

  const title = SSSearchResult.title(sampleItem);
  expect(title).toEqual(sampleItem.title.split("|")[0].trim());
});

it("`SSSearchResult` should return the htmlTitle from the search result", () => {
  const { SSSearchResult } = Resolver;
  const sampleItem = generateSearchItem();

  const htmlTitle = SSSearchResult.htmlTitle(sampleItem);
  expect(htmlTitle).toEqual(sampleItem.htmlTitle.split("|")[0].trim());
});

it("`SSSearchResult` should return the link from the search result", () => {
  const { SSSearchResult } = Resolver;
  const sampleItem = generateSearchItem();

  const link = SSSearchResult.link(sampleItem);
  expect(link).toEqual(sampleItem.link);
});

it("`SSSearchResult` should return the displayLink from the search result", () => {
  const { SSSearchResult } = Resolver;
  const sampleItem = generateSearchItem();

  const displayLink = SSSearchResult.displayLink(sampleItem);
  expect(displayLink).toEqual(sampleItem.displayLink);
});

it("`SSSearchResult` should return the description from the search result", () => {
  const { SSSearchResult } = Resolver;
  const sampleItem = generateSearchItem();

  const description = SSSearchResult.description(sampleItem);
  expect(description).toEqual(sampleItem.snippet);
});

it("`SSSearchResult` should return the htmlDescription from the search result", () => {
  const { SSSearchResult } = Resolver;
  const sampleItem = generateSearchItem();

  const htmlDescription = SSSearchResult.htmlDescription(sampleItem);
  expect(htmlDescription).toEqual(sampleItem.htmlSnippet);
});

it("`SSSearchResult` should return null for type if no pagemap in result", () => {
  const { SSSearchResult } = Resolver;
  const sampleItem = generateSearchItem();
  delete sampleItem.pagemap;

  const resultType = SSSearchResult.type(sampleItem);
  expect(resultType).toEqual(null);
});

it("`SSSearchResult` should return null for type if no metatags in pagemap in result", () => {
  const { SSSearchResult } = Resolver;
  const sampleItem = generateSearchItem();
  delete sampleItem.pagemap.metatags;

  const resultType = SSSearchResult.type(sampleItem);
  expect(resultType).toEqual(null);
});

it("`SSSearchResult` should return the type of the search result", () => {
  const { SSSearchResult } = Resolver;
  const sampleItem = generateSearchItem();

  const resultType = SSSearchResult.type(sampleItem);
  expect(resultType).toEqual(sampleItem.pagemap.metatags[0]["og:type"]);
});

it("`SSSearchResult` should return null for section if no pagemap in result", () => {
  const { SSSearchResult } = Resolver;
  const sampleItem = generateSearchItem();
  delete sampleItem.pagemap;

  const section = SSSearchResult.section(sampleItem);
  expect(section).toEqual(null);
});

it("`SSSearchResult` should return null for type if no metatags in pagemap in result", () => {
  const { SSSearchResult } = Resolver;
  const sampleItem = generateSearchItem();
  delete sampleItem.pagemap.metatags;

  const section = SSSearchResult.section(sampleItem);
  expect(section).toEqual(null);
});

it("`SSSearchResult` should return the section from the search result", () => {
  const { SSSearchResult } = Resolver;
  const sampleItem = generateSearchItem();

  const section = SSSearchResult.section(sampleItem);
  expect(section).toEqual(sampleItem.pagemap.metatags[0]["article:section"]);
});

it("`SSSearchResult` should return false if there is no image in the search result", () => {
  const { SSSearchResult } = Resolver;
  const sampleItem = generateSearchItem();
  delete sampleItem.pagemap;

  const image = SSSearchResult.image(sampleItem);
  expect(image).toBeFalsy();
});

it("`SSSearchResult` should return the image from the search result", () => {
  const { SSSearchResult } = Resolver;
  const sampleItem = generateSearchItem();

  const image = SSSearchResult.image(sampleItem);
  expect(image).toEqual(sampleItem.pagemap.cse_image[0].src);
});

it("`SSSearch` should return the total", () => {
  const { SSSearch } = Resolver;
  const sampleSearch = generateSearch();

  const total = SSSearch.total(sampleSearch);
  expect(total).toEqual(sampleSearch.total);
});

it("`SSSearch` should return next", () => {
  const { SSSearch } = Resolver;
  const sampleSearch = generateSearch();

  const next = SSSearch.next(sampleSearch);
  expect(next).toEqual(sampleSearch.next);
});

it("`SSSearch` should return previous", () => {
  const { SSSearch } = Resolver;
  const sampleSearch = generateSearch();

  const previous = SSSearch.previous(sampleSearch);
  expect(previous).toEqual(sampleSearch.previous);
});

it("`SSSearch` should return items", () => {
  const { SSSearch } = Resolver;
  const sampleItems = [
    generateSearchItem(),
    generateSearchItem(),
  ];
  const sampleSearch = generateSearch(sampleItems);

  const items = SSSearch.items(sampleSearch);
  expect(items).toEqual(sampleSearch.items);
});
