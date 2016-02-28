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

import { lookupNav } from "../ee/mysql"

const NavigationChildType = new GraphQLObjectType({
  name: "NavigationChild",
  fields: {
    id: { type: GraphQLInt },
    text: { type: GraphQLString },
    link: { type: GraphQLString },
    sort: { type: GraphQLInt },
    image: { type: GraphQLString },
  }
})

const NavigationType = new GraphQLObjectType({
  name: "Navigation",
  fields: {
    id: { type: GraphQLInt },
    text: { type: GraphQLString },
    link: { type: GraphQLString },
    sort: { type: GraphQLInt },
    image: { type: GraphQLString },
    children: { type: new GraphQLList(NavigationChildType) }
  }
})

const navigation = {
  type: new GraphQLList(NavigationType),
  args: {
    nav: { type: new GraphQLNonNull(GraphQLString) },
    ttl: { type: GraphQLInt },
    cache: { type: GraphQLBoolean },
  },
  resolve: (_, { nav, ttl, cache }) => {
    return lookupNav(nav, ttl, cache)
  }
}

export {
  navigation
}
