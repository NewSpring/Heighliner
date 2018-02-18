export default {
  Query: {
    geolocate(_, { origin, destinations }, { models }) {
      const query = `origins=${encodeURI(origin)}&destinations=${encodeURI(
        destinations
      )}`;
      return models.GGeolocate.query(query);
    },
  },

  GGeoLocate: {
    destination_addresses: ({ destination_addresses }) => destination_addresses,
    origin_addresses: ({ origin_addresses }) => origin_addresses,
    rows: ({ rows }) => rows,
    status: ({ status }) => status,
  },

  GGeoRow: {
    elements: ({ elements }) => elements,
  },

  GGeoElement: {
    distance: ({ distance }) => distance,
    duration: ({ duration }) => duration,
    status: ({ status }) => status,
  },

  GGeoValue: {
    text: ({ text }) => text,
    value: ({ value }) => value,
  },
};
