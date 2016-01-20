// schema.js
import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
} from "graphql"

import Promise from "bluebird"

import { Likes, Users } from "../apollos"
import MySQL, { lookupById }from "../ee/mysql"

import LikeType from "./shared/EE/like"

export default {
  type: new GraphQLList(LikeType),
  args: { person: { type: GraphQLInt } },
  description: "List of likes of a person",
  resolve: (_, { person }) => {
    return Users.findOne({"services.rock.PersonId": person}, "_id")
      .then((user) => {
        return Likes.find({ userId: user._id })
      })
      .then((likes) => {

        let promises = likes.map((x) => {
          return lookupById(x.toJSON().entryId)
        })

        return Promise.all(promises)
      })
  }
}
