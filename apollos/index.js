
import {
  schema as userSchema,
  resolvers as User,
} from "./users/schema";

import { Users } from "./users/connector";

export const schema = [
  ...userSchema,
];

export const resolveFunctions = {
  Query: {
    currentUser(_, args, { connectors }){
      return connectors.Users.currentUser;
    },
  },
  ...User,
};

export const connectors = {
  Users,
}
