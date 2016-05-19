// schema.js
import {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
} from "graphql"

const ColorType = new GraphQLObjectType({
  name: "Color",
  fields: () => ({
    id: {
      type: GraphQLInt,
      resolve: color => color.id
    },
    value: {
      type: GraphQLString,
      resolve: color => color.value
    },
    description: {
      type: GraphQLString,
      resolve: color => color.description
    }
  })
})

export default ColorType
