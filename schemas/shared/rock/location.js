
// schema.js
import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLFloat,
} from "graphql"


const LocationType = new GraphQLObjectType({
  name: "Location",
  fields: () => ({
    id: { type: GraphQLInt, resolve: location => location.Id },
    name: { type: GraphQLString, resolve: location => location.Name },
    street1: { type: GraphQLString, resolve: location => location.Street1 },
    street2: { type: GraphQLString, resolve: location => location.Street2 },
    city: { type: GraphQLString, resolve: location => location.City },
    state: { type: GraphQLString, resolve: location => location.State },
    country: { type: GraphQLString, resolve: location => location.Country },
    zip: { type: GraphQLString, resolve: location => location.PostalCode },
    latitude: { type: GraphQLFloat, resolve: location => location.Latitude },
    longitude: { type: GraphQLFloat, resolve: location => location.Longitude },
  })
})

export {
  LocationType
}
