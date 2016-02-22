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
import { load } from "../util/cache"

import { Likes, Users } from "../apollos"
import { People, api, parseEndpoint } from "../rock"

import { PersonType } from "./shared/rock/person"

export default {
  type: PersonType,
  // description: "A person record in Rock",
  args: {
    id: {
      type: GraphQLInt
    },
    mongoId: {
      type: GraphQLString
    },
    ttl: {
      type: GraphQLInt
    },
    cache: {
      type: GraphQLBoolean,
      defaultValue: true
    },
  },
  resolve: (_, { mongoId, id, ttl, cache }) => {

    if (!mongoId && !id) {
      throw new Error("An id is required for person lookup")
    }

    if (id) {
      return People.get(id, ttl, cache)
        .then((people) => (people[0]))

    } else if (mongoId) {

      return load(
        JSON.stringify({"user-_id": mongoId }),
        () => (Users.findOne({"_id": mongoId }, "services.rock.PersonId"))
      , ttl, cache)
        .then((user) => {

          if (user && user.services.rock) {
            return People.get(user.services.rock.PersonId, ttl, cache)
          }

          return [{}]
        })
        .then((people) => (people[0]))
    }


  }
}
