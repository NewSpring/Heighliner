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

import { lookupSet } from "../ee/mysql"

import ContentType from "./shared/EE/like"

const lowReorderSet = {
  type: ContentType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLInt) }
  },
  resolve: (_, { id }) => {
    return lookupById(id)
  }
}

export {
  lowReorderSet
}

export default {
  type: new GraphQLList(ContentType),
  args: {
    setName: {
      type: new GraphQLNonNull(GraphQLString)
    },
    ttl: {
      type: GraphQLInt
    },
    cache: {
      type: GraphQLBoolean
    },
  },
  description: "All dynamic low reorder sets with data from content channels",
  resolve: (_, { setName, ttl, cache = true }) => {
    return lookupSet(setName, ttl, cache)
  }
}
