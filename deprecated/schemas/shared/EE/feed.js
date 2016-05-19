// schema.js
import {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
} from "graphql"

import { FeedContentType } from "./content"

const FeedMetaType = new GraphQLObjectType({
  name: "FeedMeta",
  fields: {
    siteId: { type: GraphQLInt },
    date: { type: GraphQLString },
    channelId: { type: GraphQLInt }
  }
})

const FeedType = new GraphQLObjectType({
  name: "Feed",
  fields: () => ({
    title: {
      type: GraphQLString,
      resolve: feedItem => feedItem.title
    },
    id: {
      type: GraphQLInt,
      resolve: feedItem => feedItem.entryId
    },
    collectionId: {
      type: GraphQLInt,
      resolve: feedItem => feedItem.collectionId
    },
    status: {
      type: GraphQLString,
      resolve: feedItem => feedItem.status
    },
    channelName: {
      type: GraphQLString,
      resolve: feedItem => feedItem.channelName
    },
    meta: {
      type: FeedMetaType,
      resolve: feedItem => feedItem.meta
    },
    content: {
      type: FeedContentType,
      resolve: feedItem => feedItem.content
    },
  })
})

export default FeedType
