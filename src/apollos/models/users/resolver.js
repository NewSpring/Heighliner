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
};
