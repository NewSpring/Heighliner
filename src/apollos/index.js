
import {
  schema as userSchema,
  mocks as userMocks,
  resolver as User,
  connector as Users,
} from "./users"

export const schema = [
  ...userSchema,
];

export const resolvers = {
  Query: {
    currentUser(_, args, { connectors }) {
      return connectors.Users.currentUser;
    },
  },
  ...User,
};

export const connectors = {
  ...Users,
};

export const queries = [
  "currentUser: User"
];

export let mocks = {
  Query: () => ({
    currentUser() { return {} },
  }),
  ...userMocks,
}

export default {
  connectors,
  resolvers,
  mocks,
  schema,
}
