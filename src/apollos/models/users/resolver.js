
import { createGlobalId } from "../../../util";

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
      return models.User.authorizeUser(email, password);
    },
    deauthorizeUser(_, $, { models, hashedToken, user }) {
      return models.User.deauthorizeUser(user._id, hashedToken);
    },
  },

  AuthorizeUserMutationResponse: {
    id: ({ id }) => id,
    token: ({ token }) => token,
    tokenExpires: ({ tokenExpires }) => tokenExpires,
  },

  DeauthorizeUserMutationResponse: {},

};
