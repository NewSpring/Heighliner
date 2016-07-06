import { geography } from "mssql-geoparser";
import { createGlobalId } from "../../../util";

export default {

  Query: {
    campuses: (_, { name, id }, { models }) => models.Campus.find({ Id: id, Name: name }),
  },

  Campus: {
    id: ({ Id }: any, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    entityId: ({ Id }) => Id,
    name: ({ Name }) => Name,
    shortCode: ({ ShortCode }) => ShortCode,
    guid: ({ Guid }) => Guid,
    locationId: ({ LocationId }) => LocationId,
    location: ({ LocationId }, _, { models }) => {
      if (!LocationId) return null;

      return models.Campus.findByLocationId(LocationId);
    },
  },

  Location: {
    id: ({ Id }: any, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    name: ({ Name }) => Name,
    street1: ({ Street1 }) => Street1,
    street2: ({ Street2 }) => Street2,
    city: ({ City }) => City,
    state: ({ State }) => State,
    country: ({ Country }) => Country,
    zip: ({ PostalCode }) => PostalCode,
    latitude: ({ GeoPoint, latitude }) => {
      if (latitude) return latitude;
      if (!GeoPoint) return null;
      try {
        const { points } = geography(GeoPoint);
        return points[0].x;
      } catch (e) { return null; }

    },
    longitude: ({ GeoPoint, longitude }) => {
      if (longitude) return longitude;
      if (!GeoPoint) return null;
      try {
        const { points } = geography(GeoPoint);
        return points[0].y;
      } catch (e) { return null; }
    },
    distance: ({ Id, Distance }) => { // tslint:disable-line
      if (Distance) return Distance;

      return null;
      // XXX get distance from the person
      // this is typically used from a geo based lookup
    },
  },

};
