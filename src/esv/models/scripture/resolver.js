
export default {
  Query: {
    scripture(_, { query }, { models }): string {
      return models.ESV.get(query);
    },
  },

  ESVScripture: {
    html: (data) => data,
  },
};
