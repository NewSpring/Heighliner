// schema.js
import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
  GraphQLBoolean,
} from "graphql"

import { load } from "../util/cache"
import Promise from "bluebird"

import { Likes, Users } from "../apollos"
import MySQL, { lookupById }from "../ee/mysql"

import LikeType from "./shared/EE/like"

export default {
  type: new GraphQLList(LikeType),
  args: {
    person: {
      type: GraphQLInt
    },
    ttl: {
      type: GraphQLInt
    },
    cache: {
      type: GraphQLBoolean,
      defaultValue: true
    },
  },
  description: "List of likes of a person",
  resolve: (_, { person, cache, ttl }) => {
    return load(
      JSON.stringify({"services.rock.PersonId": person }),
      () => (Users.findOne({"services.rock.PersonId": person }, "_id"))
    , ttl, cache)
      .then((user) => {
        return load(
          JSON.stringify({ userId: user._id }),
          () => (Likes.find({ userId: user._id })
            .then((likes) => (likes.map(x => x.toJSON())))
          )
        )
      })
      .then((likes) => {

        let promises = likes.map((x) => {
          return lookupById(x.entryId)
        })

        return Promise.all(promises)
      })
  }
}
