import { flatten } from "lodash";
import { allData } from "geo-from-ip";
import { geocode } from "google-geocoding";
import { createGlobalId } from "../../../util";

function getPhotoFromTag(tag) {
  const photos = {
    food: "//s3.amazonaws.com/ns.assets/apollos/groups/group-food.jpg",
    gaming: "//s3.amazonaws.com/ns.assets/apollos/groups/group-games.jpg",
    hobbies: "//s3.amazonaws.com/ns.assets/apollos/groups/group-hobbies.jpg",
    moms: "//s3.amazonaws.com/ns.assets/apollos/groups/group-moms.jpg",
    motorsports: "//s3.amazonaws.com/ns.assets/apollos/groups/group-motorsports.jpg", // tslint:disable-line
    outdoor: "//s3.amazonaws.com/ns.assets/apollos/groups/group-outdoors.jpg",
    "sports/fitness": "//s3.amazonaws.com/ns.assets/apollos/groups/group-sports.jpg", // tslint:disable-line
  };
  return photos[tag.toLowerCase()] || null;
}

function getPhotoFromDemo(demo) {
  const photos = {
    coed: "//s3.amazonaws.com/ns.assets/apollos/groups/group-coed.jpg",
    married: "//s3.amazonaws.com/ns.assets/apollos/groups/group-married.jpg",
    men: "//s3.amazonaws.com/ns.assets/apollos/groups/group-men.jpg",
    women: "//s3.amazonaws.com/ns.assets/apollos/groups/group-women.jpg",
  };
  return photos[demo.toLowerCase()] || null;
}

function getPhotoFromType(type) {
  const photos = {
    care: "//s3.amazonaws.com/ns.assets/apollos/groups/group-care.jpg",
    interests: "//s3.amazonaws.com/ns.assets/apollos/groups/group-interests.jpg", // tslint:disable-line
    study: "//s3.amazonaws.com/ns.assets/apollos/groups/group-study.jpg",
  };
  return photos[type.toLowerCase()] || null;
}

function resolveAttribute(id: number, resolver?): (d: any, a: any, c: any) => Promise<any> {
  if (!resolver) resolver = x => x;
  // XXX type this better
  return (data, args, context) => {
    const { AttributeValues } = data;
    const { models } = context;
    const chunk = AttributeValues.filter(x => x.Attribute && x.Attribute.Id === id)[0];
    if (!chunk) return Promise.resolve(null)
      .then((x) => resolver(x, data, args, context));

    return models.Rock.getAttributeValuesFromId(chunk.Id, { models })
      .then((x) => resolver(x, data, args, context));
  };
}

export default {

  Query: {
    groups: async (_, { offset, limit, attributes = [], query }, { models, ip }) => {
      const geo = { latitude: null, longitude: null };
      // XXX lookup users lat and long from ip
      const geoData = allData(ip);
      geo.latitude = geoData.location.latitude;
      geo.longitude = geoData.location.longitude;
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
            // XXX we don't really want to reject this because
            // this is an additive feature
            if (err) return resolve({});
            resolve(result);
          });
        }) as any;

        geo.latitude = googleGeoData.lat;
        geo.longitude = googleGeoData.lng;
      }


      return models.Group.findByAttributesAndQuery({ query, attributes }, { limit, offset, geo });
    },
    groupAttributes: (_, $, { models }) => {
      const ids = [
        1409, // demographic
        // 5406, // kid friendly
        16815, // tags
        16814, // type
      ];
      const queries = ids.map(id => models.Rock.getAttributesFromId(id, { models }));
      return Promise.all(queries).then(flatten)
        .then(x => x.filter(y => y.Value !== "Interests"));
    },
  },

  GroupMember: {
    id: ({ Id }: any, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    role: ({ GroupTypeRole }) => GroupTypeRole && GroupTypeRole.Name, // XXX should we expand this?
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
    ageRange: resolveAttribute(691, (x: number[] = []) => {
      // don't consider [0,0] an age range
      const hasAgeRange = x.length && x.reduce((start, finish) => (start && finish));
      if (!hasAgeRange) return null;
      return x;
    }),
    campus: ({ CampusId }, _, { models }) => models.Campus.getFromId(CampusId),
    demographic: resolveAttribute(1409, x => x && x.length && x[0].Value),
    description: ({ Description }) => Description,
    distance: ({ Id, Distance }, _, { models, ip }) => {
      if (Distance) return Distance * 0.000621371;

      const geo = { latitude: null, longitude: null };
      // XXX lookup users lat and long from ip
      const geoData = allData(ip);
      geo.latitude = geoData.location.latitude;
      geo.longitude = geoData.location.longitude;

      return models.Group.getDistanceFromLatLng(Id, geo)
        .then(x => x && x * 0.000621371);

    }, // convert to miles
    entityId: ({ Id }) => Id,
    id: ({ Id }: any, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    kidFriendly: resolveAttribute(5406),
    locations: ({ Id }, _, { models }) => models.Group.getLocationsById(Id),
    members: ({ Id }, _, { models }) => models.Group.getMembersById(Id),
    name: ({ Name }) => Name,
    photo: resolveAttribute(2569, async (photo, { AttributeValues }, _, { models }) => {
      if (photo && photo.Path) return photo.Path;

      // check for tags first
      const firstTag = await resolveAttribute(16815, x => x && x.length && x[0].Value)(
        { AttributeValues }, _, { models }
      );

      if (firstTag) return getPhotoFromTag(firstTag);

      // photo from demographic
      const demographic = await resolveAttribute(1409, x => x && x.length && x[0].Value)(
        { AttributeValues }, _, { models }
      );

      if (demographic) return getPhotoFromDemo(demographic);

      // type goes last since its required
      const type = await resolveAttribute(16814, x => x && x.length && x[0].Value)(
        { AttributeValues }, _, { models }
      );

      if (type) return getPhotoFromType(type);

      return null;
    }),
    schedule: ({ ScheduleId }, _, { models }) => models.Group.getScheduleFromScheduleId(ScheduleId),
    tags: resolveAttribute(16815, x => {
      if (x && x.length) return x;
      return [];
    }),
    type: resolveAttribute(16814, x => x && x.length && x[0].Value),
  },

  GroupSearch: {
    count: ({ count }) => count,
    results: ({ results }) => results,
  },

};
