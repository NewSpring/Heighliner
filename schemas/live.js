// schema.js
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
    streamUrl: { type: GraphQLString }
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
})

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
}

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
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(dummyData)
      }, 30)
      /*

        Do look up from the DB

      */
    })
  }
}


// import { load } from "../util/cache"
//
// import { Likes, Users } from "../apollos"
// import { People, api, parseEndpoint } from "../rock"
//
// import { PersonType } from "./shared/rock/person"
//
// export default {
//   type: PersonType,
//   // description: "A person record in Rock",
//   args: {
//     id: {
//       type: GraphQLInt
//     },
//     mongoId: {
//       type: GraphQLString
//     },
//     ttl: {
//       type: GraphQLInt
//     },
//     cache: {
//       type: GraphQLBoolean,
//       defaultValue: true
//     },
//   },
//   resolve: (_, { mongoId, id, ttl, cache }) => {
//
//     if (!mongoId && !id) {
//       throw new Error("An id is required for person lookup")
//     }
//
//     if (id) {
//       return People.get(id, ttl, cache)
//         .then((people) => (people[0]))
//
//     } else if (mongoId) {
//
//       return load(
//         JSON.stringify({"user-_id": mongoId }),
//         () => (Users.findOne({"_id": mongoId }, "services.rock.PersonId"))
//       , ttl, cache)
//         .then((user) => {
//
//           if (user && user.services.rock) {
//             return People.get(user.services.rock.PersonId, ttl, cache)
//           }
//
//           return [{}]
//         })
//         .then((people) => (people[0]))
//     }
//
//
//   }
// }
