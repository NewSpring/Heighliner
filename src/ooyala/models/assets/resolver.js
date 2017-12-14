/* eslint camelcase: 0 */

export default {
  Query: {
    backlot(_, $, { models }) {
      return models.Ooyala.getBacklot();
    },
    asset(_, { query }, { models }) {
      return models.Ooyala.getAsset(query);
    },
  },

  Ooyala: {
    name: ({ name }) => name,
    description: ({ description }) => description,
    embedCode: ({ embed_code }) => embed_code,
    status: ({ status }) => status,
    duration: ({ duration }) => duration,
    tags: async ({ embed_code }, _, { models }) => await models.Ooyala.getLabels(embed_code),
    source: async ({ embed_code }, _, { models }) => await models.Ooyala.getSource(embed_code),
  },
};
