// import { pick } from "lodash"
import { createGlobalId } from "../../../util";

function resolveAttribute(id: number, resolver?): (d: any, a: any, c: any) => Promise<any> {
  if (!resolver) resolver = x => x;
  // XXX type this better
  return ({ AttributeValues }, _, { models }) => {
    const chunk = AttributeValues.filter(x => x.Attribute && x.Attribute.Id === id)[0];

    if (!chunk) return Promise.resolve(null);
    return models.Rock.getAttributeValuesFromId(chunk.Id, { models })
      .then(resolver);
  };
}

export default {

  Query: {
    groups: (_, { name, id, attributes }, { models }) => {
      if (attributes) return models.Group.findByAttributes(attributes);

      return models.Group.find({ Id: id, Name: name });
    },
  },

  GroupMember: {
    id: ({ Id }: any, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    role: ({ GroupTypeRole }) => GroupTypeRole.Name, // XXX should we expand this?
    person: ({ PersonId }, _, { models }) => models.Person.getFromId(PersonId),
  },

  GroupLocation: {
    id: ({ Id }: any, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    location: ({ LocationId }, _, { models }) => {
      // XXX abstract to location model
      // models.Location.getFromId(LocationId);
      return models.Group.getLocationFromLocationId(LocationId);
    },
  },

  GroupSchedule: {
    day: ({ WeeklyDayOfWeek }) => WeeklyDayOfWeek,
    description: ({ Description }) => Description,
    end: ({ EffectiveEndDate }) => EffectiveEndDate,
    id: ({ Id }: any, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    name: ({ Name }) => Name,
    start: ({ EffectiveStartDate }) => EffectiveStartDate,
    time: ({ WeeklyTimeOfDay }) => WeeklyTimeOfDay,
  },

  Group: {
    active: ({ IsActive }) => IsActive,
    ageRange: resolveAttribute(691),
    campus: ({ CampusId }, _, { models }) => models.Campus.getFromId(CampusId),
    demographic: resolveAttribute(1409, x => x.length && x[0].Value),
    description: ({ Description }) => Description,
    id: ({ Id }: any, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    kidFriendly: resolveAttribute(5406),
    locations: ({ Id }, _, { models }) => models.Group.getLocationsById(Id),
    members: ({ Id }, _, { models }) => models.Group.getMembersById(Id),
    name: ({ Name }) => Name,
    photo: resolveAttribute(2569, x => x && x.Path),
    schedule: ({ ScheduleId }, _, { models }) => models.Group.getScheduleFromScheduleId(ScheduleId),
    tags: resolveAttribute(16815),
    type: resolveAttribute(16814, x => x.length && x[0].Value),
  },

};
