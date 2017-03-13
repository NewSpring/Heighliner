import { flatten } from "lodash";
import { allData } from "geo-from-ip";
import { geocode } from "google-geocoding";
import Moment from "moment";
import { createGlobalId } from "../../../util";

const MutationReponseResolver = {
  error: ({ error }) => error,
  success: ({ success, error }) => success || !error,
  code: ({ code }) => code,
};

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

function resolveAttribute(id, resolver) {
  if (!resolver) resolver = x => x;
  // XXX type this better
  return (data, args, context) => {
    const { AttributeValues } = data;
    const { models } = context;
    const chunk = AttributeValues.filter(x => x.Attribute && x.Attribute.Id === id)[0];
    if (!chunk) {
      return Promise.resolve(null)
      .then(x => resolver(x, data, args, context)); }

    return models.Rock.getAttributeValuesFromId(chunk.Id, { models })
      .then(x => resolver(x, data, args, context));
  };
}

export default {

  Query: {
    groups: async (
      _, { campuses = [], schedules=[], offset, limit, attributes = [], query, clientIp }, { models, ip, person },
    ) => {
      if (campuses.length) {
        campuses = campuses.map(x => ({ Name: { $like: x } }));
        campuses = await models.Campus.find({ $or: campuses });
        campuses = campuses.map(x => x.Id);
      }

      if (schedules.length) schedules = schedules.filter((x) => x);

      let geo = { latitude: null, longitude: null };
      // XXX move to better location / cleanup
      if (clientIp && ip.match("204.116.47")) {
        // newspring ip match
        const campusIpMap = {
          10.7: { latitude: 34.933124, longitude: -81.994480 },
          10.6: { latitude: 32.915373, longitude: -80.100173 },
          10.5: { latitude: 34.030287, longitude: -81.098588 },
          10.4: { latitude: 35.065126, longitude: -82.007086 },
          10.31: { latitude: 33.934511, longitude: -80.363124 },
          "10.30": { latitude: 34.951512, longitude: -81.087497 },
          10.3: { latitude: 34.800165, longitude: -82.488371 },
          10.29: { latitude: 32.271941, longitude: -80.943806 },
          10.28: { latitude: 33.572048, longitude: -81.774888 },
          10.27: { latitude: 34.111041, longitude: -80.882638 },
          10.25: { latitude: 34.685131, longitude: -82.895683 },
          10.24: { latitude: 33.715901, longitude: -78.925047 },
          10.23: { latitude: 34.212175, longitude: -79.797055 },
          10.22: { latitude: 34.852042, longitude: -82.354571 },
          "10.20": { latitude: 34.800165, longitude: -82.488371 },
          10.16: { latitude: 34.778159, longitude: -82.487048 }, // NH
          10.14: { latitude: 34.194508, longitude: -82.193192 },
          10.13: { latitude: 33.979398, longitude: -81.307923 },
          10.1: { latitude: 34.595434, longitude: -82.622224 },
          "10.0": { latitude: 34.595434, longitude: -82.622224 },
        };
        // get first two values
        const matcher = clientIp.split(".").slice(0, 2).join(".").trim();
        for (const cpId in campusIpMap) {
          if (matcher === cpId) {
            geo = campusIpMap[cpId];
            break;
          }
        }
      } else if (person && person.Id) {
        const { latitude, longitude } = await models.Person.getHomesFromId(person.Id)
          .then(([x]) => {
            if (!x) return {};
            if (!x.GeoPoint) return x;
            return models.Group.getLocationFromLocationId(x.Id);
          });
        if (latitude && longitude) {
          geo.longitude = longitude;
          geo.latitude = latitude;
        } else {
          const geoData = allData(ip);
          geo.latitude = geoData.location.latitude;
          geo.longitude = geoData.location.longitude;
        }
      } else {
        const geoData = allData(ip);
        geo.latitude = geoData.location.latitude;
        geo.longitude = geoData.location.longitude;
      }


      attributes = attributes.filter(x => x); // only truthy values
      if (attributes.indexOf("kid friendly") > -1) {
        attributes[attributes.indexOf("kid friendly")] = "childcare";
      }
      const zipRegex = /(\d{5}$)|(^\d{5}-\d{4}$)/;

      // parse query for zipcodes
      if (query && query.match(zipRegex)) {
        const zip = query.match(zipRegex)[0];

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
        });

        geo.latitude = googleGeoData.lat;
        geo.longitude = googleGeoData.lng;
      }

      return models.Group.findByAttributesAndQuery(
        { query, attributes, campuses, schedules }, { limit, offset, geo },
      );
    },
    groupAttributes: (_, $, { models }) => {
      const ids = [
        1409, // demographic
        5406, // kid friendly
        16815, // tags
        16814, // type
      ];
      const queries = ids.map(id => models.Rock.getAttributesFromId(id, { models }));
      return Promise.all(queries).then(flatten)
        .then(x => x.filter(y => y.Value !== "Interests"))
        .then(x => x.map((y) => {
          y.Value = y.Value === "Childcare" ? "kid friendly" : y.Value;
          return y;
        }));
    },
  },

  Mutation: {
    requestGroupInfo: async (
      _, { groupId, message, communicationPreference }, { models, person },
    ) => {
      if (!person) return { code: 401, success: false, error: "Must be logged in to make this request" };
      return await models.Group.requestGroupInfo({ groupId, message, communicationPreference }, person);
    },
  },

  GroupMember: {
    id: ({ Id }, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    role: ({ GroupTypeRole }) => GroupTypeRole && GroupTypeRole.Name, // XXX should we expand this?
    person: ({ PersonId }, _, { models }) => models.Person.getFromId(PersonId),
  },

  GroupLocation: {
    id: ({ Id }, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    location: ({ LocationId }, _, { models }) =>
      // XXX abstract to location model
      // models.Location.getFromId(LocationId);
       models.Group.getLocationFromLocationId(LocationId)
    ,
  },

  GroupSchedule: {
    day: ({ WeeklyDayOfWeek }) => WeeklyDayOfWeek,
    description: ({ WeeklyTimeOfDay, WeeklyDayOfWeek }) => {
      if (!WeeklyTimeOfDay || !WeeklyDayOfWeek) return null;

      try {
        const week = Moment(WeeklyDayOfWeek, "E").format("dddd");
        const time = Moment.utc(WeeklyTimeOfDay).format("h:mm A");

        return `${week} @ ${time}`;
      } catch (e) {
        return null;
      }
    },
    end: ({ EffectiveEndDate }) => EffectiveEndDate,
    id: ({ Id }, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    name: ({ Name }) => Name,
    start: ({ EffectiveStartDate }) => EffectiveStartDate,
    time: ({ WeeklyTimeOfDay }) => WeeklyTimeOfDay,
  },

  Group: {
    active: ({ IsActive }) => IsActive,
    ageRange: resolveAttribute(691, (x = []) => {
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
    id: ({ Id }, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    kidFriendly: resolveAttribute(5406),
    locations: ({ Id }, _, { models }) => models.Group.getLocationsById(Id),
    members: ({ Id }, _, { models }) => models.Group.getMembersById(Id),
    name: ({ Name }) => Name,
    photo: resolveAttribute(2569, async (photo, { AttributeValues }, _, { models }) => {
      if (photo && photo.Path) return photo.Path;

      // check for tags first
      const firstTag = await resolveAttribute(16815, x => x && x.length && x[0].Value)(
        { AttributeValues }, _, { models },
      );

      if (firstTag) return getPhotoFromTag(firstTag);

      // photo from demographic
      const demographic = await resolveAttribute(1409, x => x && x.length && x[0].Value)(
        { AttributeValues }, _, { models },
      );

      if (demographic) return getPhotoFromDemo(demographic);

      // type goes last since its required
      const type = await resolveAttribute(16814, x => x && x.length && x[0].Value)(
        { AttributeValues }, _, { models },
      );

      if (type) return getPhotoFromType(type);

      return null;
    }),
    schedule: ({ ScheduleId }, _, { models }) => models.Group.getScheduleFromScheduleId(ScheduleId),
    tags: resolveAttribute(16815, (x) => {
      if (x && x.length) return x;
      return [];
    }),
    type: resolveAttribute(16814, x => x && x.length && x[0].Value),
  },

  GroupSearch: {
    count: ({ count }) => count,
    results: ({ results }) => results,
  },

  GroupsMutationResponse: {
    ...MutationReponseResolver,
  },
};
