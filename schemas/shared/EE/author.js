// schema.js
import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
} from "graphql"

const AuthorType = new GraphQLObjectType({
  name: "Author",
  fields: () => ({
    firstName: {
      type: GraphQLString,
      resolve: content => content.firstName
    },
    lastName: {
      type: GraphQLString,
      resolve: content => content.lastName
    },
    fullName: {
      type: GraphQLString,
      resolve: content => content.fullName
    },
    id: {
      type: GraphQLInt,
      resolve: content => content.authorId
    }
  })
})

export default AuthorType
