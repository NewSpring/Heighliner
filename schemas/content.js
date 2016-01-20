// schema.js
import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
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
    limit: {
      type: GraphQLInt,
      defaultValue: 20
    },
    skip: {
      type: GraphQLInt,
      defaultValue: 0
    },
  },
  description: "All dynamic content channels",
  resolve: (_, { channel, limit, skip }) => {
    return lookupByChannel(channel, limit, skip)
  }
}
