import { flatten, uniqBy, reverse } from "lodash";
import { allData } from "geo-from-ip";
import { geocode } from "google-geocoding";
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
    groups: async (_, { offset, limit, attributes, query }, { models, ip }) => {
      const geoPoint = { latitude: null, longitude: null };
      // XXX lookup users lat and long from ip
      const geoData = allData(ip);
      geoPoint.latitude = geoData.location.latitude;
      geoPoint.longitude = geoData.location.longitude;
      attributes = attributes.filter(x => x); // only truthy values

      const zipRegex = /(\d{5}$)|(^\d{5}-\d{4}$)/;

      // parse query for zipcodes
      if (query && query.match(zipRegex)) {
        let zip = query.match(zipRegex)[0];

        // remove zipcode data
        query = query.replace(zipRegex, "").trim();

        // find by zipcode
        const googleGeoData = await new Promise((resolve, reject) => {
          geocode(zip, (err, result) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(result);
          });
        }) as any;

        geoPoint.latitude = googleGeoData.lat;
        geoPoint.longitude = googleGeoData.lng;
      }

      if (attributes && attributes.length) {
        let promises = [];

        promises.push(models.Group.findByAttributes(attributes, {
          limit, offset, geoPoint,
        }));

        if (query) {
          promises.push(models.Group.findByQuery({ query }, {
            limit, offset, geoPoint,
          }));
        }

        return Promise.all(promises)
          // flatten all results
          .then(flatten)
          // remove duplicates
          .then(x => {
            let count = 0;

            let results = [];
            for (let queryType of x) {
              count += queryType.count;
              results = results.concat(queryType.results);
            }

            // search > tags
            results = uniqBy(reverse(results), "Id");

            // XXX how do we get an accurate count?
            return {
              count,
              results,
            };
          })
          // XXX sory by distance
          .then(x => x)
          ;
      }

      return models.Group.findByQuery({ query }, { limit, offset, geoPoint });
    },
    groupAttributes: (_, $, { models }) => {
      const ids = [
        1409, // demographic
        // 5406, // kid friendly
        16815, // tags
        16814, // type
      ];
      const queries = ids.map(id => models.Rock.getAttributesFromId(id, { models }));
      return Promise.all(queries).then(flatten);
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
    ageRange: resolveAttribute(691, (x: number[]) => {
      // don't consider [0,0] an age range
      const hasAgeRange = x.reduce((start, finish) => (start && finish));
      if (!hasAgeRange) return null;
      return x;
    }),
    campus: ({ CampusId }, _, { models }) => models.Campus.getFromId(CampusId),
    demographic: resolveAttribute(1409, x => x.length && x[0].Value),
    description: ({ Description }) => Description,
    entityId: ({ Id }) => Id,
    id: ({ Id }: any, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    kidFriendly: resolveAttribute(5406),
    locations: ({ Id }, _, { models }) => models.Group.getLocationsById(Id),
    members: ({ Id }, _, { models }) => models.Group.getMembersById(Id),
    name: ({ Name }) => Name,
    photo: resolveAttribute(2569, x => x && x.Path),
    schedule: ({ ScheduleId }, _, { models }) => models.Group.getScheduleFromScheduleId(ScheduleId),
    tags: resolveAttribute(16815, x => {
      if (x.length) return x;
      return [];
    }),
    type: resolveAttribute(16814, x => x.length && x[0].Value),
  },

  GroupSearch: {
    count: ({ count }) => count,
    results: ({ results }) => results,
  },

};
