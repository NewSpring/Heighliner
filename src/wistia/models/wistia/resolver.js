/* eslint camelcase: 0 */

export default {
  Query: {
    project(_, { hashed_id }, { models }) {
      return models.Wistia.getProject(hashed_id);
    },
    media(_, { hashed_id }, { models }) {
      return models.Wistia.getMedia(hashed_id);
    },
  },

  Mutation: {
    createProject: (_, { name }, { models }) => models.Wistia.createProject(name),
    createMedia: (_, data, { models }) => models.Wistia.createMedia(data),
  },

  WistiaMedia: {
    id: ({ id }) => id,
    name: ({ name }) => name,
    project: data => data,
    type: ({ type }) => type,
    status: ({ status }) => status,
    progress: ({ progress }) => progress,
    section: ({ section }) => section,
    thumbnail: ({ thumbnail }) => thumbnail,
    duration: ({ duration }) => duration,
    created: ({ created }) => created,
    updated: ({ updated }) => updated,
    assets: data => data,
    hashed_id: ({ hashed_id }) => hashed_id,
    description: ({ description }) => description,
  },
  WistiaMediaAsset: {
    url: ({ url }) => url,
    width: ({ width }) => width,
    height: ({ height }) => height,
    fileSize: ({ fileSize }) => fileSize,
    contentType: ({ contentType }) => contentType,
    type: ({ type }) => type,
  },
  WistiaProject: {
    id: ({ id }) => id,
    name: ({ name }) => name,
    description: ({ description }) => description,
    mediaCount: ({ mediaCount }) => mediaCount,
    medias: ({ medias }) => medias,
    created: ({ created }) => created,
    updated: ({ updated }) => updated,
    hashed_id: ({ hashedId }) => hashedId,
    canUpload: ({ anonymousCanUpload }) => anonymousCanUpload,
    canDownload: ({ anonymousCanDownload }) => anonymousCanDownload,
    publicId: ({ publicId }) => publicId,
  },
};
