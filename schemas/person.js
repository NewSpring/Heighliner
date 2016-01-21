// schema.js
import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
} from "graphql"

import Promise from "bluebird"
import { load } from "../util/cache"

import { Likes, Users } from "../apollos"
import { People, api, parseEndpoint } from "../rock"
import MySQL, { lookupById }from "../ee/mysql"

import PersonCampusType from "./shared/rock/person-campus"
import PersonHomeType from "./shared/rock/person-home"
import PersonLikeType from "./shared/EE/like"


let PersonType = new GraphQLObjectType({
  name: "Person",
  description: "A NewSpring Person",
  fields: () => ({
    firstName: {
      type: GraphQLString,
      resolve: person => person.FirstName
    },
    lastName: {
      type: GraphQLString,
      resolve: person => person.LastName
    },
    email: {
      type: GraphQLString,
      resolve: person => person.Email
    },
    campus: {
      type: PersonCampusType,
      resolve({ Id }) {
        return api.get(parseEndpoint(`
          Groups/GetFamilies/${Id}?
            $expand=
              Campus
            &$select=
              Campus/Name,
              Campus/ShortCode,
              Campus/Id
        `))
      }
    },
    home: {
      type: PersonHomeType,
      resolve({ Id }) {
        return api.get(parseEndpoint(`
          Groups/GetFamilies/${Id}?
            $expand=
              GroupLocations,
              GroupLocations/Location,
              GroupLocations/GroupLocationTypeValue,
            &$select=
              GroupLocations/Location/Street1,
              GroupLocations/Location/Street2,
              GroupLocations/Location/City,
              GroupLocations/Location/State,
              GroupLocations/Location/Country,
              GroupLocations/Location/PostalCode,
              GroupLocations/Location/Id,
              GroupLocations/GroupLocationTypeValue/Value
        `))
      }
    },
    likes: {
      type: new GraphQLList(PersonLikeType),
      resolve({ Id }) {
        return load(
          JSON.stringify({"services.rock.PersonId": Id }),
          () => (Users.findOne({"services.rock.PersonId": Id }, "_id"))
        )
          .then((user) => {
            return load(
              JSON.stringify({ userId: user._id }),
              () => (Likes.find({ userId: user._id })
                .then((likes) => (likes.map(x => x.toJSON())))
              )
            )
          })
          .then((likes) => {

            let promises = likes.map((x) => {
              return lookupById(x.entryId)
            })

            return Promise.all(promises)
          })
      }
    }
  })
})

export default {
  type: PersonType,
  // description: "A person record in Rock",
  args: { id: { type: new GraphQLNonNull(GraphQLInt) } },
  resolve: (_, { id }) => People.get(id)
}
