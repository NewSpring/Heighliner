
import { createGlobalId } from "../../../util";

export default {
  Query: {
    currentUser(_: any, args: any, { user }: any): any {
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
