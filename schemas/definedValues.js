// schema.js
import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLScalarType,
} from "graphql"

import { get } from "./../rock/models/definedValues"
import { Attributes } from "./../rock"

const DefinedValueType = new GraphQLObjectType({
  name: "DefinedValues",
  fields: () => ({
    id: {
      type: GraphQLInt,
      resolve: type => type.Id
    },
    value: {
      type: GraphQLString,
      resolve: type => type.Value
    },
    description: {
      type: GraphQLString,
      resolve: type => type.Description
    },
    attribute: {
      type: GraphQLString,
      args: { key: { type: new GraphQLNonNull(GraphQLString) } },
      resolve: ({ Id }, { key }) => {
        return Attributes.get(Id, key)
          .then(value => (value ? `${value}` : null))
      }
    }
  })
})

export default {
  type: new GraphQLList(DefinedValueType),
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLInt)
    },
    limit: {
      type: GraphQLInt,
      defaultValue: 20
    },
    skip: {
      type: GraphQLInt,
      defaultValue: 0
    },
    ttl: {
      type: GraphQLInt
    },
    cache: {
      type: GraphQLBoolean
    },
  },
  description: "All defined values in Rock ",
  resolve: (_, { id, limit, skip, ttl, cache = true }) => {
    return get(id, limit, skip, ttl, cache)
  }
}
