
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

const SermonType = new GraphQLObjectType({
  name: "Sermon",
  fields: {
    title: { type: GraphQLString },
    id: {
      type: GraphQLInt, 
      resolve: sermon => sermon.entryId
    },
    collectionId: { type: GraphQLInt },
    status: { type: GraphQLString },
    channelName: { type: GraphQLString },
    meta: { type: MetaType },
    content: {
      type: new GraphQLObjectType({
        name: "SermonContent",
        fields: {
          speakers: {
            type: GraphQLString
          }
        }
      })
    }
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
    },
    sermons: {
      type: new GraphQLList(SermonType),
      resolve: like => like.sermons
    }
  })
})

export default PersonLikeType
