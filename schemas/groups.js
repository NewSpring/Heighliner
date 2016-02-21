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

function generateAttribute(type, key){
  return {
    type: type,
    args: {
      ttl: { type: GraphQLInt },
      cache: { type: GraphQLBoolean, defaultValue: true },
    },
    resolve: ({ Id }, { ttl, cache }) => Attributes.get(Id, key, ttl, cache),
  }
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
    campus: {
      type: CampusType,
      args: {
        ttl: { type: GraphQLInt },
        cache: { type: GraphQLBoolean, defaultValue: true },
      },
      resolve: (group, { ttl, cache }) => {
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
        ttl: { type: GraphQLInt },
        cache: { type: GraphQLBoolean, defaultValue: true },
      },
      resolve: ({ Id }, { ttl, cache }) => {
        let query = parseEndpoint(`
          Groups?
            $filter=
              Id eq ${Id}&
            $expand=
              Members/Person,
              Members/GroupRole
        `)
        
        return api.get(query, ttl, cache)
          .then(([{ Members }]) => {
            return Members
          })
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
          GroupLocations
    `)

    return api.get(query, ttl, cache)
      .then(groups => groups[0])

  }
}

export {
  group
}

export default {
  type: new GraphQLList(GroupType),
  args: {
    groupTypeId: { type: GraphQLInt, defaultValue: 25 },
    lat: { type: GraphQLFloat },
    lng: { type: GraphQLFloat },
    sortByDistance: { type: GraphQLBoolean, defaultValue: true },
    ttl: { type: GraphQLInt },
    cache: { type: GraphQLBoolean, defaultValue: true },
  },
  resolve: (_, args) => {

    const { groupTypeId, lat, lng, sortByDistance, ttl, cache } = args

    // @TODO full group lists
    let query = parseEndpoint(`
      Groups/ByLatLong?
        groupTypeId=${groupTypeId}&
        latitude=${lat}&
        longitude=${lng}&
        sortByDistance=${sortByDistance}
    `)
    return api.get(query, ttl, cache)
      .then((response) => {
        return response
      })

  }
}
