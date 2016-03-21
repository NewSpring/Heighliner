
// schema.js
import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
} from "graphql"

import ContentType from "./content"
import AuthorType from "./author"
import TrackType from "./tracks"

const MetaType = new GraphQLObjectType({
  name: "Meta",
  fields: {
    urlTitle: { type: GraphQLString },
    siteId: { type: GraphQLInt },
    date: { type: GraphQLString },
    channelId: { type: GraphQLInt }
  }
})

const PersonLikeType = new GraphQLObjectType({
  name: "Likes",
  fields: () => ({
    title: {
      type: GraphQLString,
      resolve: like => like.title
    },
    id: {
      type: GraphQLInt,
      resolve: like => like.entryId
    },
    collectionId: {
      type: GraphQLInt,
      resolve: like => like.collectionId
    },
    status: {
      type: GraphQLString,
      resolve: like => like.status
    },
    channelName: {
      type: GraphQLString,
      resolve: like => like.channelName
    },
    meta: {
      type: MetaType,
      resolve: like => like.meta
    },
    content: {
      type: ContentType,
      resolve: like => like.content
    },
    author: {
      type: AuthorType,
      resolve: like => like.author
    },
    tracks: {
      type: new GraphQLList(TrackType),
      resolve: like => like.tracks
    }
  })
})

export default PersonLikeType
