// schema.js
import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
} from "graphql"


const getHome = (locations) => {
  let home = locations[0].GroupLocations.filter((x) => (
    x.GroupLocationTypeValue.Value === "Home"
  ))[0]

  home || (home = { Location: {} })

  return home.Location

}


const PersonHomeType = new GraphQLObjectType({
  name: "Home",
  fields: () => ({
    street1: {
      type: GraphQLString,
      resolve: locations => getHome(locations).Street1
    },
    street2: {
      type: GraphQLString,
      resolve: locations => getHome(locations).Street2
    },
    street2: {
      type: GraphQLString,
      resolve: locations => getHome(locations).Street2
    },
    city: {
      type: GraphQLString,
      resolve: locations => getHome(locations).City
    },
    state: {
      type: GraphQLString,
      resolve: locations => getHome(locations).State
    },
    country: {
      type: GraphQLString,
      resolve: locations => getHome(locations).Country
    },
    zip: {
      type: GraphQLString,
      resolve: locations => getHome(locations).PostalCode
    },
    id: {
      type: GraphQLInt,
      resolve: locations => getHome(locations).Id
    }
  })
})

export default PersonHomeType
