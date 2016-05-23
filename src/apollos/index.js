
import {
  schema as userSchema,
  mocks as userMocks,
  resolver as User,
  model as Users,
} from "./users";

export const schema = [
  ...userSchema,
];

export const resolvers = {
  Query: {
    currentUser(_, args, { user }) {
      return user;
    },
  },
  ...User,
};

export const models = {
  ...Users,
};

export const queries = [
  "currentUser: User"
];

export let mocks = {
  Query: () => ({
    currentUser() { return {}; },
  }),
  ...userMocks,
};

export default {
  models,
  resolvers,
  mocks,
  schema,
};
