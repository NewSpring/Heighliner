
export default {
  Query: {
    scripture(_: any, { query }, { models }: any): any {
      return models.ESV.get(query);
    },
  },

  ESVScripture: {
    html: (data) => data,
  },
};
