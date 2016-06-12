// schema.js
import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLBoolean,
} from "graphql"

import Promise from "bluebird"

import { lookupByChannel, lookupById } from "../ee/mysql"

import ContentType from "./shared/EE/like"

const content = {
  type: ContentType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLInt) }
  },
  resolve: (_, { id }) => {
    return lookupById(id)
  }
}

export {
  content
}

export default {
  type: new GraphQLList(ContentType),
  args: {
    channel: {
      type: new GraphQLNonNull(GraphQLString)
    },
    collectionId: {
      type: GraphQLInt
    },
    limit: {
      type: GraphQLInt,
      defaultValue: 20
    },
    skip: {
      type: GraphQLInt,
      defaultValue: 0
    },
    ttl: {
      type: GraphQLInt
    },
    cache: {
      type: GraphQLBoolean,
      defaultValue: true
    },
  },
  description: "All dynamic content channels",
  resolve: (_, { channel, collectionId, limit, skip, ttl, cache }) => {
    // hotfix
    if (channel === "albums") {
      channel = "newspring_albums"
    }
    return lookupByChannel(channel, collectionId, limit, skip, ttl, cache)
  }
}
