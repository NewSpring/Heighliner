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

  Asset: {
    name: ({ name }) => name,
    description: ({ description }) => description,
    embedCode: ({ embed_code }) => embed_code,
    status: ({ status }) => status,
    duration: ({ duration }) => duration,
    createdAt: ({ createdAt }) => createdAt,
    previewImage: ({ previewImage }) => previewImage,
    filename: ({ filename }) => filename,
    labels: async ({ embed_code }, _, { models }) => await models.Ooyala.getLabels(embed_code),
    source: async ({ embed_code }, _, { models }) => await models.Ooyala.getSource(embed_code),
  },
  Label: {
    name: ({ name }) => name,
    parent: ({ parent_id }) => parent_id,
    fullName: ({ full_name }) => full_name,
    id: ({ id }) => id,
  },
};
