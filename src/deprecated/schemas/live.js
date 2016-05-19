// schema.js
import Path from "path"

import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLInt,
  GraphQLId,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLBoolean,
} from "graphql"

import Promise from "bluebird"
import { getLiveFeed } from "../ee/mysql"
import ContentType from "./shared/EE/content"

const MediaType = new GraphQLObjectType({
  name: "MediaType",
  fields: () => ({
    embedCode: { type: GraphQLString }
  }),
});

const LiveFeedType = new GraphQLObjectType({
  name: "LiveFeed",
  description: "Data around what is currently live",
  fields: () => ({
    live: { type: GraphQLBoolean },
    title: { type: GraphQLString },
    content: { type: ContentType },
    media: { type: MediaType },
  }),
});

/*
let dummyData = {

  "title": "Watch Live: Mother's Day",
  "content": {
    "images": [
      {
        "cloudfront": "http://dg0ddngxdz549.cloudfront.net/images/cached/images/remote/http_s3.amazonaws.com/ns.images/newspring/collection/series_newspring/41405.marketing.cen.web.mothersdayassets_1x1_224_158_90_c1.jpg",
        "filelabel": "1x1"
      }
    ],
    "description": "Moms are awesome. They deserve a lot of credit. So what better way to celebrate mothers than by doing something big, exciting, and fun ? Don 't miss Mother's Day, May 8 at NewSpring.",
    "body": "< p > Moms are awesome.They deserve a lot of credit. < br / > < br / > So what better way to celebrate mothers than by doing something big, exciting, and fun ? < br / > < br / > Don 't miss Mother's Day, May 8 at NewSpring. < /p>"
  },
  "live": "true",
  "media": {
    "streamUrl": "http: //ooyalahd2-f.akamaihd.net/i/newspring02_delivery@120045/master.m3u8"
  }
}*/

export default {
  type: LiveFeedType,
  description: "Live feed data and status",
  args: {
    site: {
      type: GraphQLString,
      defaultValue: 'newspring',
    },
  },
  resolve: (_, { site }) => {

    return getLiveFeed(site)

  }
}
