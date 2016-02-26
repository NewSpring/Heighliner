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

import { api, parseEndpoint, Attributes } from "../rock"
import { CampusType } from "./shared/rock/campus"
import { GroupMemberType } from "./shared/rock/group-member"
import { LocationType } from "./shared/rock/location"

const ScheduleType = new GraphQLObjectType({
  name: "Schedule",
  fields: () => ({
    id: { type: GraphQLInt, resolve: group => group.Id },
    name: { type: GraphQLString, resolve: group => group.Name },
    description: { type: GraphQLString, resolve: group => group.Description },
    start: { type: GraphQLString, resolve: group => group.EffectiveStartDate },
    end: { type: GraphQLString, resolve: group => group.EffectiveEndDate },
    day: { type: GraphQLString, resolve: group => group.WeeklyDayOfWeek },
    time: { type: GraphQLString, resolve: group => group.WeeklyTimeOfDay },
    scheduleText: { type: GraphQLString, resolve: group => group.FriendlyScheduleText },
  })
})

const GroupLocationType = new GraphQLObjectType({
  name: "GroupLocation",
  fields: () => ({
    id: { type: GraphQLInt, resolve: group => group.Id },
    location: {
      type: LocationType,
      resolve: (group, { ttl, cache }) => {
        if (group.Location && group.Location.Id) {
          return group.Location
        }

        return api.get(`Locations/${group.LocationId}`)
      }
    }
  })
})

function generateAttribute(type, key, defaultValue){
  let attr = {
    type: type,
    args: {
      ttl: { type: GraphQLInt, defaultValue: 604800 },
      cache: { type: GraphQLBoolean, defaultValue: true },
    },
    resolve: ({ Id }, { ttl, cache }) => {
      return Attributes.get(Id, key, ttl, cache)
        .then(value => (value ? value : defaultValue))
    },
  }

  return attr
}

const GroupType = new GraphQLObjectType({
  name: "Group",
  fields: () => ({
    id: { type: GraphQLInt, resolve: group => group.Id },
    parentGroupId: { type: GraphQLInt, resolve: group => group.ParentGroupId },
    typeId: { type: GraphQLInt, resolve: group => group.GroupTypeId },
    childCare: generateAttribute(GraphQLBoolean, "HasChildcare"),
    ageRange: generateAttribute(new GraphQLList(GraphQLInt), "AgeRange"),
    demographic: generateAttribute(GraphQLString, "Topic"),
    maritalStatus: generateAttribute(GraphQLString, "MaritalStatus"),
    photo: generateAttribute(GraphQLString, "GroupPhoto", "https://s3.amazonaws.com/ns.assets/apollos/Artboard+9+Copy.png"),
    campus: {
      type: CampusType,
      args: {
        ttl: { type: GraphQLInt, defaultValue: 2592000 },
        cache: { type: GraphQLBoolean, defaultValue: true },
      },
      resolve: (group, { ttl, cache }) => {

        if (group.Campus && group.Campus.Id) {
          return group.Campus
        }

        return api.get(`Campuses?$select=Name,ShortCode,Id,LocationId&$filter=Id eq ${group.CampusId}`, ttl, cache)
          .then((campus) => (campus[0]))
      }
    },
    name: { type: GraphQLString, resolve: group => group.Name },
    description: { type: GraphQLString, resolve: group => group.Description },
    active: { type: GraphQLBoolean, resolve: group => group.IsActive },
    order: { type: GraphQLInt, resolve: group => group.Order },
    allowGuests: { type: GraphQLBoolean, resolve: group => group.AllowGuests },
    public: { type: GraphQLBoolean, resolve: group => group.IsPublic },
    schedule: {
      type: ScheduleType,
      resolve: group => {
        if (group.Schedule && group.Schedule.Id) {
          return group.Schedule
        }
      }
    },
    members: {
      type: new GraphQLList(GroupMemberType),
      args: {
        ttl: { type: GraphQLInt, defaultValue: 86400 },
        cache: { type: GraphQLBoolean, defaultValue: true },
      },
      resolve: ({ Id }, { ttl, cache }) => {

        function getBatchedPhotos(members){
          let batchId = []
          for (let member of members) {
            if (member.Person.PhotoId) {
              batchId.push(`Id eq ${member.Person.Id}`)
            }
          }

          // until we have direct SQL access, this is at least a start of a batch
          if (batchId.length) {
            return api.get(`People?$filter=${batchId.join(" or ")}&$expand=Photo`)
              .then((people) => {

                let joinedMembers = []
                for (let member of members) {
                  for (let person of people) {
                    if (person.Id === member.Person.Id) {
                      member.Person = person
                      continue
                    }
                  }
                  joinedMembers.push(member)
                }

                return joinedMembers

              })
          }

          return members
        }

        if (group.Members && group.Members.length) {
          return getBatchedPhotos()
        }

        let query = parseEndpoint(`
          Groups?
            $filter=
              Id eq ${Id}&
            $expand=
              Members/Person,
              Members/GroupRole
        `)

        return api.get(query, ttl, cache)
          .then(([{ Members }]) => getBatchedPhotos(Members))
      }
    },
    locations: {
      type: new GraphQLList(GroupLocationType),
      resolve: (group, { ttl, cache }) => {

        // already expanded
        if (group.GroupLocations.length) {
          return group.GroupLocations
        }

      }
    }
  })
})

const group = {
  type: GroupType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLInt) },
    ttl: { type: GraphQLInt },
    cache: { type: GraphQLBoolean, defaultValue: true },
  },
  resolve: (_, { id, ttl, cache }) => {

    let query = parseEndpoint(`
      Groups?
        $filter=
          Id eq ${id}
        &$expand=
          Schedule,
          GroupLocations,
          Members/Person,
          Members/GroupRole

    `)

    return api.get(query, ttl, cache)
      .then(groups => groups[0])
// 2300272
  }
}


export {
  group
}

export default {
  type: new GraphQLList(GroupType),
  args: {
    groupTypeId: { type: GraphQLInt, defaultValue: 25 },
    first: { type: GraphQLInt },
    after: { type: GraphQLInt },
    lat: { type: GraphQLFloat },
    lng: { type: GraphQLFloat },
    distance: { type: GraphQLInt, defaultValue: 25 },
    sortByDistance: { type: GraphQLBoolean, defaultValue: true },
    ttl: { type: GraphQLInt },
    cache: { type: GraphQLBoolean, defaultValue: true },
  },
  resolve: (_, args, {fieldASTs}, ) => {

    const {
      groupTypeId,
      lat,
      lng,
      sortByDistance,
      distance,
      ttl,
      cache,
      first,
      after
    } = args

    // @TODO full group lists
    let query = parseEndpoint(`
      Groups/ByLatLong?
        $filter=
          IsActive eq true and
          IsPublic eq true
        &
          groupTypeId=${groupTypeId}&
          latitude=${lat}&
          longitude=${lng}&
          sortByDistance=${sortByDistance}&
          maxDistanceMiles=${distance}

    `)

    if (first) {
      query += `&$top=${first}`
    }

    if (after) {
      query += `&$skip=${after}`
    }

    return api.get(query, ttl, cache)
      .then((results) => {
        return results.filter((result) => {
          return result.IsActive && result.IsPublic
        })
      })
      // .then((results) => {
      //   // pre lookup all campuses because its way cheaper than a lookup for each
      //   // group
      //   // @TODO parse fieldASTs to see if campus is being used
      //   // @TODO move to a promise All so we can batch more
      //   return api.get(`Campuses?$select=Name,ShortCode,Id,LocationId`)
      //     .then((campuses) => {
      //       let campusObj = {}
      //       for (let campus of campuses) {
      //         campusObj[campus.Id] = campus
      //       }
      //
      //       for (let group of results) {
      //         group.Campus = campusObj[group.CampusId]
      //       }
      //
      //       return results
      //     })
      // })
      // .then((results) => {
      //
      //   // until Members is included with the result, we need to do a batched
      //   // lookup. This could get expensive quickly
      //   let batchIds = []
      //   for (let group of results) {
      //     batchIds.push(`(Id eq ${group.Id})`)
      //   }
      //
      //   if (batchIds.length) {
      //     let query = parseEndpoint(`
      //       Groups?
      //         $expand=
      //           Schedule,
      //           GroupLocations,
      //           Members/Person,
      //           Members/GroupRole
      //     `)
      //
      //     query += `&$filter=${batchIds.join(" or ")}`
      //     console.log(query)
      //     return api.get(query, ttl, cache)
      //       .then((res) => {
      //         console.log(res)
      //         return res
      //       })
      //
      //   }
      //
      //   return results
      //
      // })

  }
}
