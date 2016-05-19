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
import { CampusType } from "./shared/rock/campus"


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
      query = `Campuses?&$filter=Id eq ${id}`
    } else if (name) {
      query = `Campuses?&$filter=Name eq '${name}'`
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
    return api.get("Campuses?$filter=IsActive eq true", ttl, cache)
  }
}
