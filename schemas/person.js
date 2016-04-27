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
  resolve: (_, { id, ttl, cache }, context) => {

    if (id) {
      return People.get(id, ttl, cache)
        .then((people) => (people[0]))
    } else {
      console.log(context);
      if (context.user === null || !context.user.services.rock.PrimaryAliasId) {
        throw new Error("No person found")
      }

      if (context.user && context.user.services.rock) {
        return People.get(context.user.services.rock.PersonId, ttl, cache)
          .then((people) => (people[0]));
      }

      return [{}]
    }


  }
}
