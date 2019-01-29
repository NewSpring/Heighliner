import striptags from "striptags";
import { flatten } from "lodash";
import { createClient as createGoogleMapsClient } from "@google/maps";
import Moment from "moment";
import ical from "ical";
import { createGlobalId } from "../../../util";

const MutationReponseResolver = {
  error: ({ error }) => error,
  success: ({ success, error }) => success || !error,
  code: ({ code }) => code
};

function getPhotoFromTag(tag) {
  const photos = {
    food: "//s3.amazonaws.com/ns.assets/apollos/groups/group-food.jpg",
    gaming: "//s3.amazonaws.com/ns.assets/apollos/groups/group-games.jpg",
    hobbies: "//s3.amazonaws.com/ns.assets/apollos/groups/group-hobbies.jpg",
    moms: "//s3.amazonaws.com/ns.assets/apollos/groups/group-moms.jpg",
    motorsports:
      "//s3.amazonaws.com/ns.assets/apollos/groups/group-motorsports.jpg",
    outdoor: "//s3.amazonaws.com/ns.assets/apollos/groups/group-outdoors.jpg",
    "sports/fitness":
      "//s3.amazonaws.com/ns.assets/apollos/groups/group-sports.jpg"
  };
  return photos[tag.toLowerCase()] || null;
}

function getPhotoFromDemo(demo) {
  const photos = {
    coed: "//s3.amazonaws.com/ns.assets/apollos/groups/group-coed.jpg",
    married: "//s3.amazonaws.com/ns.assets/apollos/groups/group-married.jpg",
    men: "//s3.amazonaws.com/ns.assets/apollos/groups/group-men.jpg",
    women: "//s3.amazonaws.com/ns.assets/apollos/groups/group-women.jpg"
  };
  return photos[demo.toLowerCase()] || null;
}

function getPhotoFromType(type) {
  const photos = {
    care: "//s3.amazonaws.com/ns.assets/apollos/groups/group-care.jpg",
    interests:
      "//s3.amazonaws.com/ns.assets/apollos/groups/group-interests.jpg",
    study: "//s3.amazonaws.com/ns.assets/apollos/groups/group-study.jpg"
  };
  return photos[type.toLowerCase()] || null;
}

function resolveAttribute(id, resolver) {
  if (!resolver) resolver = x => x;
  // XXX type this better
  return (data, args, context) => {
    const { AttributeValues } = data;
    const { models } = context;
    let chunk;

    if (Array.isArray(AttributeValues)) {
      chunk = AttributeValues.filter(
        x => x.Attribute && x.Attribute.Id === id
      )[0];
    }
    if (!chunk) {
      return Promise.resolve(null).then(x => resolver(x, data, args, context));
    }

    return models.Rock.getAttributeValuesFromId(chunk.Id, { models }).then(x =>
      resolver(x, data, args, context)
    );
  };
}

export default {
  Query: {
    groups: async (
      _,
      {
        campus,
        campuses = [], // Deprecated
        schedules = [],
        offset,
        limit,
        attributes = [],
        query,
        latitude,
        longitude,
        zip
      },
      { models, ip, person }
    ) => {
      const geo = { latitude: null, longitude: null };

      // XXX this is to maintain backwards compat
      if (campuses.length) {
        campus = campuses.shift();
      }

      if (campus) {
        // This is the new section
        const geoCampus = await models.Campus.find({ Name: campus })
          .then(x =>
            x.map(y => ({
              Id: y.Id,
              LocationId: y.LocationId
            }))
          )
          .then(x => x.shift());

        const geoCampusData = await models.Group.getLocationFromLocationId(
          geoCampus.LocationId
        );

        if (geoCampusData.latitude && geoCampusData.longitude) {
          // Passed in directly from geolocation services
          geo.longitude = geoCampusData.longitude;
          geo.latitude = geoCampusData.latitude;
        }

        campuses = [geoCampus.Id];
      }

      if (schedules.length) {
        schedules = schedules.filter(x => x || x === "0" || x === 0);
      }

      // XXX move to better location / cleanup
      if (latitude && longitude) {
        geo.latitude = latitude;
        geo.longitude = longitude;
      } else if (person && person.Id) {
        const geoLocation = await models.Person.getHomesFromId(person.Id).then(
          ([x]) => {
            if (!x) return {};
            if (!x.GeoPoint) return x;
            return models.Group.getLocationFromLocationId(x.Id);
          }
        );
        if (geoLocation.latitude && geoLocation.longitude) {
          // Passed in directly from geolocation services
          geo.longitude = geoLocation.longitude;
          geo.latitude = geoLocation.latitude;
        }
      }

      attributes = attributes.filter(x => x); // only truthy values
      if (attributes.indexOf("kid friendly") > -1) {
        attributes[attributes.indexOf("kid friendly")] = "childcare";
      }
      const zipRegex = /(\d{5}$)|(^\d{5}-\d{4}$)/;

      // parse query for zipcodes
      if (zip || (query && query.match(zipRegex))) {
        if (!zip) {
          zip = query.match(zipRegex)[0];
          query = query.replace(zipRegex, "").trim();
        }
        // remove zipcode data
        // find by zipcode
        const googleMapsClient = createGoogleMapsClient({
          key: process.env.GOOGLE_GEO_LOCATE,
          Promise
        });

        await googleMapsClient
          .geocode({ address: zip })
          .asPromise()
          .then(response => {
            const location = response.json.results[0].geometry.location;
            geo.latitude = location.lat;
            geo.longitude = location.lng;
          })
          .catch(err => {
            console.log(err);
          });
      }

      return models.Group.findByAttributesAndQuery(
        { query, attributes, campuses, schedules },
        { limit, offset, geo }
      );
    },
    groupAttributes: (_, $, { models }) => {
      const ids = [
        1409, // demographic
        5406, // kid friendly
        16815, // tags
        16814 // type
      ];
      const queries = ids.map(id =>
        models.Rock.getAttributesFromId(id, { models })
      );
      return Promise.all(queries)
        .then(flatten)
        .then(x => x.filter(y => y.Value !== "Interests"))
        .then(x =>
          x.map(y => {
            y.Value = y.Value === "Childcare" ? "Kid Friendly" : y.Value;
            return y;
          })
        );
    }
  },

  Mutation: {
    requestGroupInfo: async (
      _,
      { groupId, message, communicationPreference },
      { models, person }
    ) => {
      if (!person) {
        return {
          code: 401,
          success: false,
          error: "Must be logged in to make this request"
        };
      }
      return await models.Group.requestGroupInfo(
        {
          groupId,
          message: striptags(message, ["<br/>"], ["\n"]),
          communicationPreference
        },
        person
      );
    }
  },

  GroupMember: {
    id: ({ Id }, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    role: ({ GroupTypeRole }) => GroupTypeRole && GroupTypeRole.Name, // XXX should we expand this?
    person: ({ PersonId }, _, { models }) => models.Person.getFromId(PersonId),
    status: ({ GroupMemberStatus }) => GroupMemberStatus
  },

  GroupLocation: {
    id: ({ Id }, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    location: ({ LocationId }, _, { models }) =>
      // XXX abstract to location model
      // models.Location.getFromId(LocationId);
      models.Group.getLocationFromLocationId(LocationId)
  },

  GroupSchedule: {
    day: ({ WeeklyDayOfWeek }) => WeeklyDayOfWeek,
    description: ({ WeeklyTimeOfDay, WeeklyDayOfWeek, iCalendarContent }) => {
      // Rock passes in day of week as 0 if sunday. moment is 1-7
      const TempWeeklyDayOfWeek = WeeklyDayOfWeek === 0 ? "7" : WeeklyDayOfWeek;
      if (!TempWeeklyDayOfWeek && !iCalendarContent) return null;
      try {
        if (TempWeeklyDayOfWeek) {
          // try the schedule fields if available
          const week = Moment(TempWeeklyDayOfWeek, "E").format("dddd");
          const time = WeeklyTimeOfDay
            ? Moment.utc(WeeklyTimeOfDay).format("h:mm A")
            : null;
          return time ? `${week} @ ${time}` : `${week}`;
        }
        // try parsing the ical string
        const key = Object.keys(ical.parseICS(iCalendarContent))[0];
        const parsed = ical.parseICS(iCalendarContent)[key];
        const days = parsed.rrule.options.byweekday;
        const parsedDays = days
          .map((day, i) => {
            const dayName = Moment()
              .day(day + 1)
              .format("dddd");
            return i < days.length - 1 ? `${dayName}, ` : `${dayName}`;
          })
          .join("");
        const parsedTime = Moment(
          `${parsed.rrule.options.byhour[0]}:${
            parsed.rrule.options.byminute[0]
          }`,
          "hh:mm"
        ).format("h:mm A");
        return `${parsedDays} @ ${parsedTime}`;
      } catch (e) {
        return null;
      }
    },
    end: ({ EffectiveEndDate }) => EffectiveEndDate,
    id: ({ Id }, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    name: ({ Name }) => Name,
    start: ({ EffectiveStartDate }) => EffectiveStartDate,
    time: ({ WeeklyTimeOfDay }) => WeeklyTimeOfDay,
    iCal: ({ iCalendarContent }) => iCalendarContent
  },

  Group: {
    active: ({ IsActive }) => IsActive,
    ageRange: resolveAttribute(691, (x = []) => {
      // don't consider [0,0] an age range
      const hasAgeRange =
        x.length && x.reduce((start, finish) => start && finish);
      if (!hasAgeRange) return null;
      return x;
    }),
    campus: ({ CampusId }, _, { models }) => models.Campus.getFromId(CampusId),
    demographic: resolveAttribute(1409, x => x && x.length && x[0].Value),
    description: ({ Description }) => Description,
    distance: ({ Distance }) => {
      if (Distance) return Distance * 0.000621371;
      return null;
    }, // convert to miles
    entityId: ({ Id }) => Id,
    id: ({ Id }, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    guid: ({ Guid }) => Guid,
    kidFriendly: resolveAttribute(5406),
    locations: ({ Id }, _, { models }) => models.Group.getLocationsById(Id),
    members: ({ Id }, _, { models }) => models.Group.getMembersById(Id),
    name: ({ Name }) => Name,
    photo: resolveAttribute(
      2569,
      async (photo, { AttributeValues }, _, { models }) => {
        if (photo && photo.Path) return photo.Path;

        // check for tags first
        const firstTag = await resolveAttribute(
          16815,
          x => x && x.length && x[0].Value
        )({ AttributeValues }, _, { models });

        if (firstTag) return getPhotoFromTag(firstTag);

        // photo from demographic
        const demographic = await resolveAttribute(
          1409,
          x => x && x.length && x[0].Value
        )({ AttributeValues }, _, { models });

        if (demographic) return getPhotoFromDemo(demographic);

        // type goes last since its required
        const type = await resolveAttribute(
          16814,
          x => x && x.length && x[0].Value
        )({ AttributeValues }, _, { models });

        if (type) return getPhotoFromType(type);

        return null;
      }
    ),
    schedule: ({ ScheduleId }, _, { models }) =>
      models.Group.getScheduleFromScheduleId(ScheduleId),
    tags: resolveAttribute(16815, x => {
      if (x && x.length) return x;
      return [];
    }),
    type: resolveAttribute(16814, x => x && x.length && x[0].Value),
    groupType: ({ GroupTypeId }) => GroupTypeId,
    isLiked({ Id }, $, { models, person = {} }, { parentType }) {
      return models.Like.hasUserLike({
        userId: person.PrimaryAliasId,
        entryId: Id,
        entryType: parentType.name
      });
    }
  },

  GroupSearch: {
    count: ({ count }) => count,
    results: ({ results }) => results
  },

  GroupsMutationResponse: {
    ...MutationReponseResolver
  }
};
