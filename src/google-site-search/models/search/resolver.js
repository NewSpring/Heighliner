function getTag(tagName, { pagemap }) {
  if (!pagemap || !pagemap.metatags) return null;
  return pagemap.metatags[0][tagName];
}

export default {
  Query: {
    search(_, { query, first, after, site }, { models }) {
      if (first > 10) first = 10;
      // adjust after to work with start
      after += 1;

      const fields = "fields=queries(nextPage/startIndex,previousPage/startIndex),searchInformation/totalResults,items(cacheId,title,htmlTitle,link,displayLink,snippet,htmlSnippet,pagemap(cse_image/src,metatags/og:url,metatags/article:section))"; // tslint:disable-line

      query += `&num=${first}&start=${after}&${fields}`;

      if (site) {
        query += `&=${site}`;
      }

      return models.SSearch.query(query).then(x => {
        let next, previous;
        if (x.queries) {
          next = x.queries.nextPage ? x.queries.nextPage[0].startIndex : 0;
          previous = x.queries.previousPage
            ? x.queries.previousPage[0].startIndex
            : 0;
        } else {
          next = 0;
          previous = 0;
        }

        return {
          total: Number(x.searchInformation.totalResults),
          next: Number(next),
          previous: Number(previous),
          items: x.items ? x.items : [],
        };
      });
    },
  },
  SSSearchResult: {
    id: ({ cacheId }) => cacheId,
    title: ({ title }) => title.split("|")[0].trim(),
    htmlTitle: ({ htmlTitle }) => htmlTitle.split("|")[0].trim(),
    link: ({ link }) => link,
    displayLink: ({ displayLink }) => displayLink,
    description: ({ snippet }) => snippet,
    htmlDescription: ({ htmlSnippet }) => htmlSnippet,
    type: data => getTag("og:type", data),
    section: data => getTag("article:section", data),
    image: ({ pagemap }) => pagemap && pagemap.cse_image[0].src,
  },
  SSSearch: {
    total: ({ total }) => total,
    next: ({ next }) => next,
    previous: ({ previous }) => previous,
    items: ({ items }) => items,
  },
};
