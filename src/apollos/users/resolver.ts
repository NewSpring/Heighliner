
import {
  UserResume,
  UserRock,
  UserServices,
  UserDocument,
} from "./model";

import { createGlobalId } from "../../util";

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
    id: ({ _id }: UserDocument, _, $, { parentType }) => createGlobalId(_id, parentType.name),
    services: ({ services }: UserDocument) => services,
    emails: ({ emails }: UserDocument) => emails,
  },

};
