// schema.js
import {
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
} from "graphql";

import Promise from "bluebird";

import { getFeed } from "../ee/mysql";

import FeedType from "./shared/EE/feed";

export default {
  // we should change this out to either be a FeedType
  // or, we should actually support all the ContentType fields
  type: new GraphQLList(FeedType),
  args: {
    excludeChannels: {
      type: new GraphQLList(GraphQLString),
      defaultValue: [],
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
      type: GraphQLBoolean
    },
  },
  description: "Combined feed of all channels",
  resolve: (_, { excludeChannels, limit, skip, ttl, cache = true }) => {
    return getFeed(excludeChannels, limit, skip, ttl, cache);
  },
}
