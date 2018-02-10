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
    createdAt: ({ created_at }) => created_at,
    previewImage: ({ preview_image_url }) => preview_image_url,
    filename: ({ original_file_name }) => original_file_name,
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
