
export default {
  Query: {
    scripture(_: any, { query }, { models }: any): string {
      return models.ESV.get(query);
    },
  },

  ESVScripture: {
    html: (data) => data,
  },
};
