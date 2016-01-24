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



import { api, parseEndpoint } from "../rock"

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
    locationId: {
      type: GraphQLString,
      resolve: campus => campus.LocationId
    },
  })
})

const campus = {
  type: CampusType,
  args: {
    id: {
      type: GraphQLInt
    },
    name: {
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
  resolve: (_, { id, name, ttl, cache }) => {

    if (!id && !name){
      throw new Error("Name of Id of campus is required")
    }

    let query;
    if (id) {
      query = `Campuses?$select=Name,ShortCode,Id,LocationId&$filter=Id eq ${id}`
    } else if (name) {
      query = `Campuses?$select=Name,ShortCode,Id,LocationId&$filter=Name eq '${name}'`
    }

    return api.get(query, ttl, cache)
      .then((campus) => (campus[0]))
  }
}

export {
  campus
}

export default {
  type: new GraphQLList(CampusType),
  args: {
    ttl: {
      type: GraphQLInt
    },
    cache: {
      type: GraphQLBoolean,
      defaultValue: true
    },
  },
  resolve: (_, { ttl, cache }) => {
    return api.get("Campuses?$select=Name,ShortCode,Id,LocationId", ttl, cache)
  }
}
