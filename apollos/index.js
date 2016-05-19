
import {
  schema as userSchema,
  resolver as User,
  connector as Users,
} from "./users"

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
  ...Users,
}
