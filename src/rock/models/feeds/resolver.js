
// import { createGlobalId } from "../../../util";

// const MutationReponseResolver = {
//   error: ({ error }) => error,
//   success: ({ success, error }) => success || !error,
//   code: ({ code }) => code,
// };

export default {

  Query: {
    userFeed: (_, { filters }, { models, person }) => {
      if (!person) return null;
      if (filters.includes("GIVING_DASHBOARD")){
        return models.Transaction.findByPersonAlias(
          person.aliases, _, _,
        );
      }
    },
  },

};
