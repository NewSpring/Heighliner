
import { merge, difference } from "lodash";

import { connect } from "./mysql";

import {
  ApplicationDefinition,
  Resolvers,
  Models,
  Mocks,
} from "../util/application";

import {
  schema as contentSchema,
  resolver as Content,
  model as Contents,
} from "./content";

import {
  schema as fileSchema,
  resolver as File,
  model as Files,
} from "./files";

import {
  schema as navigationSchema,
  resolver as Navigation,
  model as Navigations,
} from "./navigation";

export const schema = [
  ...contentSchema,
  ...fileSchema,
  ...navigationSchema,
];

export const resolvers = merge(
  {
    Query: {
      content(_, { channel, limit, skip, status }, { models }) {
        // XXX integrate collection argument?
        return models.Content.find({
          channel_name: channel,
          offset: skip,
          limit,
          status,
        });
      },
      feed(_, { excludeChannels, limit, skip, status}, { models }) {
        let channels = [
          "devotionals",
          "articles",
          "series_newspring",
          "sermons",
          "stories",
          "albums",
        ];

        // only include what user hasn't excluded
        channels = difference(channels, excludeChannels);

        return models.Content.find({
          channel_name: {
            $or: channels,
          },
          offset: skip,
          limit,
          status,
        });
      },
      navigation: (_, { nav }, { models }) => models.Navigation.find({ nav }),
    },
  },
  Content,
  File,
  Navigation
) as Resolvers;

export const models = merge(
  Contents,
  Files,
  Navigations
) as Models;

// XXX implement pagination instead of skip
// use `after` for ^^
export const queries = [
  `content(channel: String!, collection: ID, limit: Int = 20, skip: Int = 0, status: String = "open"): [Content]`,
  `feed(excludeChannels: [String], limit: Int = 20, skip: Int = 0, status: String = "open"): [Content]`,
  `navigation(nav: String!): [Navigation]`,
];

export let mocks = merge({
    Query: {
      content() { return {}; },
    },
  }
  // userMocks
) as Mocks;

export default {
  models,
  resolvers,
  mocks,
  schema,
  connect,
} as ApplicationDefinition;
