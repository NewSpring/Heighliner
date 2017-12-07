
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
    loginUser(_, $, { models, user }) {
      return models.User.loginUser(user);
    },
    registerUser(_, props, { models }) {
      return models.User.registerUser(props);
    },
    forgotUserPassword(_, props, { models }) {
      const {
        username,
        sourceURL,
      } = props;
      return models.User.forgotPassword(username, sourceURL);
    },
    resetUserPassword(_, props, { models }) {
      const {
        token,
        newPassword,
      } = props;
      return models.User.resetPassword(token, newPassword);
    },
    changeUserPassword(_, props, { models, user }) {
      const {
        oldPassword,
        newPassword,
      } = props;
      return models.User.changePassword(user, oldPassword, newPassword);
    },
  },

  UserMutationResponse: {
    id: ({ Id }) => Id,
  },
};
