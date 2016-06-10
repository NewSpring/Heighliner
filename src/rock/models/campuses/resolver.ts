
import { flatten } from "lodash";
import { createGlobalId } from "../../../util";

export default {

  Query: {
    campuses: (_, { name, id }, { models }) => models.Campus.find({ Id: id, Name: name }),
  },

  Campus: {
    id: ({ Id }: any, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    name: ({ Name }) => Name,
    shortCode: ({ ShortCode }) => ShortCode,
    guid: ({ Guid }) => Guid,
    locationId: ({ LocationId }) => LocationId,
    location: ({ LocationId }, _, { models }) => {
      if (!LocationId) return null;

      return models.Campus.findByLocationId(LocationId);
    }
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
    latitude: ({ Latitude }) => Latitude,
    longitude: ({ Longitude }) => Longitude,
    distance: ({ Id, Distance }) => {
      if (Distance) return Distance;

      return null;
      // XXX get distance from the person
      // this is typically used from a geo based lookup
    },
  }

}