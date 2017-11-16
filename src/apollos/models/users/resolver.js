
import { createGlobalId } from "../../../util";

const MutationReponseResolver = {
  error: ({ error }) => error,
  success: ({ success, error }) => success || !error,
  code: ({ code }) => code,
};


export default {
  Query: {
    currentUser(_, args, { user }) {
      return user || null;
    },
  },

  UserTokens: {
    tokens: ({ loginTokens }) => loginTokens,
  },

  UserRock: {
    id: ({ PersonId }) => PersonId,
    alias: ({ PrimaryAliasId }) => PrimaryAliasId,
  },

  UserService: {
    rock: ({ rock }) => rock,
    resume: ({ resume }) => resume,
  },

  User: {
    id: ({ _id }, _, $, { parentType }) => createGlobalId(_id, parentType.name),
    services: ({ services }) => services,
    emails: ({ emails }) => emails,
  },


  Mutation: {
    authorizeUser(_, { email, password }, { models }) {
      // XXX what should the response be if invalid/insufficient data?
      if (!email || !password) return [];
      return models.User.authorizeUser(email, password);
    },
    deauthorizeUser(_, $, { models, hashedToken }) {
      if (!hashedToken) return [];
      return models.User.deauthorizeUser(hashedToken);
    },
  },

  AuthorizeUserMutationResponse: {
    ...MutationReponseResolver,
    id() {},
    token() {},
  },

  DeauthorizeUserMutationResponse: MutationReponseResolver,

};
