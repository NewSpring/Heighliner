
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
import { load } from "../../../util/cache"

import { api, People, parseEndpoint } from "../../../rock"
import { lookupById }from "../../../ee/mysql"
import { Likes, Users } from "../../../apollos"

import PersonCampusType from "./person-campus"
import PersonLikeType from "./../EE/like"
import { LocationType } from "./location"
import { CampusType } from "./campus"

import Auth from "../../auth";

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
      args: {
        ttl: { type: GraphQLInt },
        cache: { type: GraphQLBoolean, defaultValue: true },
      },
      resolve: (person, { ttl, cache }, context) => {

        Auth.Person.enforceReadPerm(context, person);

        if (!person.Id) {
          return [{}]
        }

        return api.get(`PhoneNumbers?$filter=PersonId eq ${person.Id}`, ttl, cache)
      }
    },
    photo: {
      type: GraphQLString,
      args: {
        ttl: { type: GraphQLInt },
        cache: { type: GraphQLBoolean, defaultValue: true },
      },
      resolve: (person, {ttl, cache}) => {

        function getPhoto(person = {}) {

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

        if (!person.Photo && person.PhotoId) {
          return api.get(`People?$filter=Id eq ${person.Id}&$expand=Photo`, ttl, cache)
            .then(person => person[0])
            .then((person) => getPhoto(person))
        }

        return getPhoto(person)

      }
    },
    age: {
      type: GraphQLString,
      resolve: (person, {}, context) => {
        Auth.Person.enforceReadPerm(context, person);
        return person.Age;
      }
    },
    birthdate: {
      type: GraphQLString,
      resolve: (person, {}, context) => {
        Auth.Person.enforceReadPerm(context, person);
        return person.BirthDate;
      }
    },
    birthDay: {
      type: GraphQLString,
      resolve: (person, {}, context) => {
        Auth.Person.enforceReadPerm(context, person);
        return person.BirthDay;
      }
    },
    birthMonth: {
      type: GraphQLString,
      resolve: (person, {}, context) => {
        Auth.Person.enforceReadPerm(context, person);
        return person.BirthMonth;
      }
    },
    birthYear: {
      type: GraphQLString,
      resolve: (person, {}, context) => {
        Auth.Person.enforceReadPerm(context, person);
        return person.BirthYear;
      }
    },
    email: {
      type: GraphQLString,
      resolve: (person, {}, context) => {
        Auth.Person.enforceReadPerm(context, person);
        return person.Email;
      }
    },
    campus: {
      type: CampusType,
      args: {
        ttl: { type: GraphQLInt },
        cache: { type: GraphQLBoolean, defaultValue: true },
      },
      resolve(person, { ttl, cache }, context) {

        Auth.Person.enforceReadPerm(context, person);

        return api.get(parseEndpoint(`
          Groups/GetFamilies/${person.Id}?$expand=Campus
        `), ttl, cache).then((campus) => {
          if (campus.length && campus[0].Campus) {
            return campus[0].Campus
          }

          return {}
        })
      }
    },
    home: {
      type: LocationType,
      args: {
        ttl: { type: GraphQLInt },
        cache: { type: GraphQLBoolean, defaultValue: true },
      },
      resolve(person, { ttl, cache }, context) {

        Auth.Person.enforceReadPerm(context, person);

        return api.get(parseEndpoint(`
          Groups/GetFamilies/${person.Id}?
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
        `), ttl, cache).then((locations) => {
          if (!locations[0] || !locations[0].GroupLocations) {
            return {}
          }

          let home = locations[0].GroupLocations.filter((x) => (
            x.GroupLocationTypeValue.Value === "Home"
          ))[0]

          home || (home = { Location: {} })

          return home.Location
        })
      }
    },
    likes: {
      type: new GraphQLList(PersonLikeType),
      args: {
        ttl: { type: GraphQLInt },
        cache: { type: GraphQLBoolean, defaultValue: true },
      },
      resolve({ Id }, { ttl, cache }) {
        return load(
          JSON.stringify({"services.rock.PersonId": Id }),
          () => (Users.findOne({"services.rock.PersonId": Id }, "_id")),
        ttl, cache)
          .then((user) => {
            if (user) {
              return load(
                JSON.stringify({ userId: user._id }),
                () => (Likes.find({ userId: user._id })
                  .then((likes) => (likes.map(x => x.toJSON())))
                )
              )
            }

            return []
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

export {
  PersonType,
  PhoneNumberType,
}
