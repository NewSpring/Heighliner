
import {
  UserResume,
  UserRock,
  UserServices,
  UserDocument,
} from "./model"

export default {

  UserTokens: {
    tokens: ({ loginTokens }: UserResume) => loginTokens,
  },

  UserRock: {
    id: ({ PersonId }: UserRock) => PersonId,
    alias: ({ PrimaryAliasId }: UserRock) => PrimaryAliasId,
  },

  UserService: {
    rock: ({ rock }: UserServices) => rock,
    resume: ({ resume }: UserServices) => resume,
  },

  User: {
    id: ({ _id }: UserDocument) => _id,
    services: ({ services }: UserDocument) => services,
    emails: ({ emails }: UserDocument) => emails,
  },

};
