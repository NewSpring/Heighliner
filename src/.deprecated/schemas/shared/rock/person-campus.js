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
      resolve: location => location[0] && location[0].Campus ? location[0].Campus.Name : null
    },
    id: {
      type: GraphQLInt,
      resolve: location => location[0] && location[0].Campus ? location[0].Campus.Id : null
    },
    shortCode: {
      type: GraphQLString,
      resolve: location => location[0] && location[0].Campus ? location[0].Campus.ShortCode : null
    }
  })
})

export default PersonCampusType
