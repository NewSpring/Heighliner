// schema.js
import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLFloat,
} from "graphql"

import { api } from "../search"


function getTag(tagName, { pagemap }) {
  if (!pagemap || !pagemap.metatags) {
    return null
  }
  return pagemap.metatags[0][tagName]
}

const SearchResults = new GraphQLObjectType({
  name: "SearchResults",
  fields: () => ({
    id: { type: GraphQLString, resolve: result => result.cacheId },
    title: {
      type: GraphQLString,
      resolve: result => {
        // remove | Section | Site
        let title = result.title.split("|")
        return title[0].trim()
      }
    },
    htmlTitle: {
      type: GraphQLString,
      resolve: result => {
        // remove | Section | Site
        let title = result.htmlTitle.split("|")
        return title[0].trim()
      }
    },
    link: { type: GraphQLString, resolve: result => result.link },
    displayLink: { type: GraphQLString, resolve: result => result.displayLink },
    description: { type: GraphQLString, resolve: result => result.snippet },
    htmlDescription: { type: GraphQLString, resolve: result => result.htmlSnippet },
    type: { type: GraphQLString, resolve: result =>  getTag("og:type", result)},
    section: { type: GraphQLString, resolve: result =>  getTag("article:section", result)},
    image: { type: GraphQLString, resolve: result => {
      return result.pagemap && result.pagemap.cse_image[0].src
    } },
  })
})

const SearchResultType = new GraphQLObjectType({
  name: "SearchResultType",
  fields: () => ({
    total: { type: GraphQLInt, resolve: result => result.total},
    next: { type: GraphQLInt, resolve: result => result.next},
    previous: { type: GraphQLInt, resolve: result => result.previous},
    items: { type: new GraphQLList(SearchResults), resolve: result => result.items },
  })
})

export default {
  type: SearchResultType,
  args: {
    query: { type: new GraphQLNonNull(GraphQLString) },
    first: { type: GraphQLInt, defaultValue: 10 },
    after: { type: GraphQLInt, defaultValue: 1 },
    site: { type: GraphQLString },
    ttl: { type: GraphQLInt },
    cache: { type: GraphQLBoolean, defaultValue: true },
  },
  description: "A search across all newspring sites and apps",
  resolve: (_, { query, first, after, site, cache, ttl }) => {

    if (first > 10) { first = 10 }
    // adjust after to work with start
    after += 1

    let fields = "fields=queries(nextPage/startIndex,previousPage/startIndex),searchInformation/totalResults,items(cacheId,title,htmlTitle,link,displayLink,snippet,htmlSnippet,pagemap(cse_image/src,metatags/og:url,metatags/article:section))"

    query += `&num=${first}&start=${after}&${fields}`

    if (site) {
      query += `&=${site}`
    }

    return api.get(query, ttl, cache)
      .then((results) => {
        let next = results.queries.nextPage ? results.queries.nextPage[0].startIndex : 0
        let previous = results.queries.previousPage ? results.queries.previousPage[0].startIndex : 0

        return {
          total: Number(results.searchInformation.totalResults),
          next: Number(next),
          previous: Number(previous),
          items: results.items
        }
      })
  }
}
