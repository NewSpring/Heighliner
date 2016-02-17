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

import Promise from "bluebird"
import { load } from "../util/cache"

import { Likes, Users } from "../apollos"
import { People, api, parseEndpoint } from "../rock"
import MySQL, { lookupById }from "../ee/mysql"

import PersonCampusType from "./shared/rock/person-campus"
import PersonHomeType from "./shared/rock/person-home"
import PersonLikeType from "./shared/EE/like"


const PhoneNumberType = new GraphQLObjectType({
  name: "PhoneNumber",
  description: "A phone number from Rock",
  fields: () => ({
    number: {
      type: GraphQLString,
      resolve: number => number.Number
    },
    formated: {
      type: GraphQLString,
      resolve: number => number.NumberFormatted
    },
    extension: {
      type: GraphQLString,
      resolve: number => number.Extension
    },
    description: {
      type: GraphQLString,
      resolve: number => number.Description
    },
    id: {
      type: GraphQLInt,
      resolve: number => number.Id
    }
  })
})

const PersonType = new GraphQLObjectType({
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
    nickName: {
      type: GraphQLString,
      resolve: person => person.NickName
    },
    phoneNumbers: {
      type: new GraphQLList(PhoneNumberType),
      resolve: person => {

        if (!person.Id) {
          return [{}]
        }

        return api.get(`PhoneNumbers?$filter=PersonId eq ${person.Id}`)
      }
    },
    photo: {
      type: GraphQLString,
      resolve: person => {
        if (person.Photo && person.Photo.Path) {
          let { Path } = person.Photo

          // is relative to Rock
          if (Path[0] === "~") {
            Path = Path.substr(2)
            Path = api._.baseURL + Path

            return Path
          }

          if (Path.indexOf("?") > -1){
            Path = Path.slice(0, Path.indexOf("?"))
          }

          // is a storage provider
          return Path
        }

        if (!person.PhotoUrl) {
          person.PhotoUrl = "//dg0ddngxdz549.cloudfront.net/images/cached/images/remote/http_s3.amazonaws.com/ns.images/all/member_images/members.nophoto_1000_1000_90_c1.jpg"
        }
        
        return person.PhotoUrl
      }
    },
    age: {
      type: GraphQLString,
      resolve: person => person.Age
    },
    birthdate: {
      type: GraphQLString,
      resolve: person => person.BirthDate
    },
    birthDay: {
      type: GraphQLString,
      resolve: person => person.BirthDay
    },
    birthMonth: {
      type: GraphQLString,
      resolve: person => person.BirthMonth
    },
    birthYear: {
      type: GraphQLString,
      resolve: person => person.BirthYear
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
      args: {
        ttl: {
          type: GraphQLInt
        },
        cache: {
          type: GraphQLBoolean,
          defaultValue: true
        },
      },
      resolve({ Id }, { ttl, cache }) {
        return load(
          JSON.stringify({"services.rock.PersonId": Id }),
          () => (Users.findOne({"services.rock.PersonId": Id }, "_id")),
        ttl, cache)
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

// XGRiwjdhk8x5WGvNN
export default {
  type: PersonType,
  // description: "A person record in Rock",
  args: {
    id: {
      type: GraphQLInt
    },
    mongoId: {
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
  resolve: (_, { mongoId, id, ttl, cache }) => {

    if (!mongoId && !id) {
      throw new Error("An id is required for person lookup")
    }

    if (id) {
      return People.get(id, ttl, cache)
        .then((people) => (people[0]))

    } else if (mongoId) {

      return load(
        JSON.stringify({"user-_id": mongoId }),
        () => (Users.findOne({"_id": mongoId }, "services.rock.PersonId"))
      , ttl, cache)
        .then((user) => {

          if (user && user.services.rock) {
            return People.get(user.services.rock.PersonId, ttl, cache)
          }

          return [{}]
        })
        .then((people) => (people[0]))
    }


  }
}
