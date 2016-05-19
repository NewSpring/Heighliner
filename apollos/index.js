
import {
  schema as userSchema,
  resolver as User,
  connector as Users,
} from "./users"

export const schema = [
  ...userSchema,
];

export const resolvers = {
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

export const queries = [
  "currentUser: User"
]

export default {
  connectors,
  resolvers,
  schema,
}
