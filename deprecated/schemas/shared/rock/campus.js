
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

import { api, parseEndpoint } from "../../../rock"
import { LocationType } from "./location"

const CampusType = new GraphQLObjectType({
  name: "Campus",
  fields: () => ({
    name: {
      type: GraphQLString,
      resolve: campus => campus.Name
    },
    shortCode: {
      type: GraphQLString,
      resolve: campus => campus.ShortCode
    },
    id: {
      type: GraphQLInt,
      resolve: campus => campus.Id
    },
    guid: {
      type: GraphQLString,
      resolve: campus => campus.Guid
    },
    locationId: {
      type: GraphQLString,
      resolve: campus => campus.LocationId
    },
    location: {
      type: LocationType,
      args: {
        ttl: { type: GraphQLInt },
        cache: { type: GraphQLBoolean, defaultValue: true },
      },
      resolve: ({ LocationId }, { cache, ttl }) => {
        return api.get(`Locations/${LocationId}`, ttl, cache)
      }
    }
  })
})

export {
  CampusType
}
