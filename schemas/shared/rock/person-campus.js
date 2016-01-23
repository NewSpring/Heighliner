// schema.js
import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
} from "graphql"


const PersonCampusType = new GraphQLObjectType({
  name: "PersonCampus",
  fields: () => ({
    name: {
      type: GraphQLString,
      resolve: location => location[0].Campus.Name
    },
    id: {
      type: GraphQLInt,
      resolve: location => location[0].Campus.Id
    },
    shortCode: {
      type: GraphQLString,
      resolve: location => location[0].Campus.ShortCode
    }
  })
})

export default PersonCampusType
