export default {
  Query: {
    scripture(_, { query }, { models }) {
      return models.ESV.get(query);
    }
  },

  ESVScripture: {
    html: data => data
  }
};
