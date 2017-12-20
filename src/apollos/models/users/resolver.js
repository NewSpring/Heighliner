
import get from "lodash/get";

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
    id: (user) => {
      const {
        _id, // Deprecated Mongo User
        Id, // Rock User
      } = user;
      return Id || _id;
    },
    createdAt: (user) => {
      const {
        createdAt, // Deprecated Mongo User
        CreatedDateTime, // Rock User
      } = user;
      return CreatedDateTime || createdAt;
    },
    services: ({ services }) => services,
    emails: ({ emails }) => emails,
    email: async (user, _, { models }) => {
      const email = get(user, "emails.0.address");
      if (email) return email; // Deprecated Mongo User

      // Rock Profile
      const person = await models.User.getUserProfile(user.PersonId);
      const {
        Email,
      } = person;
      return Email;
    },
  },

  Mutation: {
    loginUser(_, props, { models }) {
      return models.User.loginUser(props);
    },
    registerUser(_, props, { models }) {
      return models.User.registerUser(props);
    },
    logoutUser(_, props, { models, authToken, user }) {
      return models.User.logoutUser({
        token: authToken,
        userId: user && user.Id,
      });
    },
    forgotUserPassword(_, props, { models }) {
      const {
        email,
        sourceURL,
      } = props;
      return models.User.forgotPassword(email, sourceURL);
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
