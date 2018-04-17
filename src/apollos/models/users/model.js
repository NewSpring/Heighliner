import crypto from "crypto";
import moment from "moment";
import stripTags from "striptags";
import Random from "meteor-random";
import {
  isEmpty,
  isNil,
  difference,
  includes,
  get,
} from "lodash";
import makeNewGuid from "./makeNewGuid";
import sendEmail from "./sendEmail";
import * as api from "./api";

import { MongoConnector } from "../../mongo";
import { defaultCache } from "../../../util/cache";
import { parseGlobalId, createGlobalId } from "../../../util/node/model";
import { FOLLOWABLE_TOPICS } from "../../../constants";

// Needs migration
const UserModel = new MongoConnector("user", {
  _id: String,
  createdAt: { type: Date, default: Date.now },
  services: {
    password: { bcrypt: String },
    rock: { PersonId: Number, PrimaryAliasId: Number },
    resume: {
      loginTokens: [{ when: Date, hashedToken: String }],
    },
  },
  emails: [{ address: String, verified: Boolean }],
  profile: { lastLogin: Date },
});

const UserTokensModel = new MongoConnector("user_tokens", {
  _id: String,
  token: String,
  type: String,
  loginId: Number,
  createdAt: { type: Date, default: Date.now },
  expireCreatedAt: { type: Date },
}, [
  {
    keys: { expireCreatedAt: 1 },
    options: { // 1 day and only reset tokens
      expireAfterSeconds: 43200,
      partialFilterExpression: { // Mongo 3.2+ only (we're on 3.0)
        type: { $eq: "reset" },
      },
    },
  },
]);

const UserIgnoredTopics = new MongoConnector("user_ignored_topics", {
  _id: String,
  userId: String,
  topic: String,
}, [
  {
    keys: { userId: 1 },
  },
]);

export class User {
  // Deprecate
  constructor({ cache } = { cache: defaultCache }) {
    this.cache = cache;
    this.model = UserModel;
    this.tokens = UserTokensModel;
    this.ignoredTopics = UserIgnoredTopics;
  }

  // Deprecate
  async getFromId(_id, globalId) {
    // try a cache lookup
    return await this.cache.get(globalId, () => this.model.findOne({ _id }));
  }

  // Deprecate
  async getByHashedToken(rawToken) {
    // allow for client or server side auth calls
    const token = crypto.createHash("sha256")
      .update(rawToken)
      .digest("base64");

    return await this.cache.get(`hashedToken:${token}`, () => this.model.findOne({
      $or: [
        { "services.resume.loginTokens.hashedToken": token },
        { "services.resume.loginTokens.hashedToken": rawToken },
      ],
    }));
  }

  async getByBasicAuth(token) {
    // Client needs to encode user and password and join by ':'
    // for all user requests including login
    try {
      return this.getByToken({ token, type: "login" });
    } catch (err) {
      throw err;
    }
  }

  async getLatestLoginByUsername(username = "") {
    const [login] = await api.get(`/UserLogins?$filter=UserName eq '${username}'`);
    return login;
  }

  getLoginById(id) {
    return api.get(`/UserLogins/${id}`);
  }

  getByToken = async ({ token, type = "reset" } = {}) => {
    try {
      const { loginId } = await this.tokens.findOne({
        token,
        type,
      });

      return this.getLoginById(loginId);
    } catch (err) {
      throw new Error("Token Expired!");
    }
  }

  getUserProfile(personId) {
    return api.get(`/People/${personId}`);
  }

  async checkUserCredentials(Username, Password) {
    try {
      // NOTE: This endpoint returns a set-cookie header
      // for cookie based authentication but I can't find
      // an endpoint where we can use that cookie to identify the user
      const isAuthorized = await api.post("/Auth/login", {
        Username,
        Password,
      });

      return isAuthorized;
    } catch (err) {
      throw new Error("User not authorized");
    }
  }

  async userExists({ email } = {}) {
    try {
      const [login] = await api.get(`/UserLogins?$filter=UserName eq '${email}'`);
      return !!login;
    } catch (err) {
      return false;
    }
  }

  loginUser = async ({ email, password, user } = {}) => {
    try {
      // special case for AD lookup
      if (email.indexOf('@newspring.cc') > -1) {
        email = email.replace(/@newspring.cc/, '');
      }
      
      await this.checkUserCredentials(email, password);

      const login = user || await this.getLatestLoginByUsername(email);

      if (!login.IsConfirmed) {
        api.post(`/UserLogins/${login.Id}`, {
          IsConfirmed: true,
        });
      }

      api.patch(`/UserLogins/${login.Id}`, {
        LastLoginDateTime: `${moment().toISOString()}`,
      });

      const person = await this.getUserProfile(login.PersonId);
      const token = `::${Random.secret()}`;

      await this.tokens.create({
        _id: Random.id(),
        loginId: login.Id,
        token,
        type: "login",
      });

      return {
        id: person.PrimaryAliasId,
        token,
      };
    } catch (err) {
      throw err;
    }
  }

  logoutUser = async ({ token, loginId } = {}) => {
    try {
      if (isNil(loginId) || isEmpty(token)) throw new Error("User is not logged in!");
      await this.tokens.remove({
        token,
        loginId,
      });
      return true;
    } catch (err) {
      throw err;
    }
  }

  createUserProfile = async (props = {}) => {
    try {
      const {
        email,
        firstName,
        lastName,
      } = props;

      return await api.post("/People", {
        Email: email,
        Guid: makeNewGuid(),
        FirstName: stripTags(firstName),
        LastName: stripTags(lastName),
        IsSystem: false,
        Gender: 0,
        RecordTypeValueId: 1,
        ConnectionStatusValueId: 67, // Web Prospect
        SystemNote: "Created from NewSpring Apollos",
      });
    } catch (err) {
      throw new Error("Unable to create profile!");
    }
  }

  createUserLogin = async (props = {}) => {
    try {
      const {
        email,
        password,
        personId,
      } = props;

      return await api.post("/UserLogins", {
        PersonId: personId,
        EntityTypeId: 27,
        UserName: email,
        IsConfirmed: true,
        PlainTextPassword: password,
        LastLoginDateTime: `${moment().toISOString()}`,
      });
    } catch (err) {
      throw new Error("Unable to create user login!");
    }
  }

  async registerUser(props = {}) {
    try {
      const {
        email,
        firstName,
        lastName,
        password,
      } = props;

      const userExists = await this.userExists({ email });
      if (userExists) throw new Error("User already exists!");

      const personId = await this.createUserProfile({
        email,
        firstName,
        lastName,
      });

      const loginId = await this.createUserLogin({
        email,
        password,
        personId,
      });

      const [user, person] = await Promise.all([
        api.get(`/UserLogins/${loginId}`),
        api.get(`/People/${personId}`),
      ]);

      // Removed saving it to a constant
      // because we don't know if this ID could change
      // from other sources (migrations, integrity checks, etc)
      const [systemEmail] = await api.get("/SystemEmails?$filter=Title eq 'Account Created'");
      if (!systemEmail) throw new Error("Account created email does not exist!");

      sendEmail(
        systemEmail.Id,
        Number(person.PrimaryAliasId),
        {
          Person: person,
          User: user,
        },
      );

      return this.loginUser({ email, password, user });
    } catch (err) {
      throw err;
    }
  }

  forgotPassword = async (email, sourceURL) => {
    try {
      const login = await this.getLatestLoginByUsername(email);
      if (!login) throw new Error("User does not exist!");

      const person = await api.get(`/People/${login.PersonId}`);
      if (!person) throw new Error("User profile does not exist!");

      const token = Random.secret();

      // NOTE: I didn't want to have to use Mongo
      // but I can't write directly to rock or have
      // rock manage password reset tokens. This works fine for now ^_^
      await this.tokens.create({
        _id: Random.id(),
        loginId: login.Id,
        token,
        type: "reset",
        expireCreatedAt: new Date(),
      });

      const [systemEmail] = await api.get("/SystemEmails?$filter=Title eq 'Reset Password'");
      if (!systemEmail) throw new Error("Reset password email does not exist!");

      sendEmail(
        systemEmail.Id,
        Number(person.PrimaryAliasId),
        {
          Person: person,
          ResetPasswordUrl: `${sourceURL}/reset-password/${token}`,
        },
      );
      return true;
    } catch (err) {
      throw err;
    }
  }

  resetPassword = async (token, newPassword) => {
    try {
      const user = await this.getByToken({ token, type: "reset" });
      if (!user) throw new Error("User does not exist!");
      if (isEmpty(newPassword)) throw new Error("New password is required");

      await api.put(`/UserLogins/${user.Id}`, {
        ...user,
        PlainTextPassword: newPassword,
        IsConfirmed: true,
        EntityTypeId: 27,
      });

      this.tokens.remove({
        loginId: user.Id,
        token,
        type: "reset",
      });

      return this.loginUser({ email: user.UserName, password: newPassword });
    } catch (err) {
      throw err;
    }
  }

  async changePassword(login, oldPassword, newPassword) {
    try {
      if (!login) throw new Error("User is not logged in!");
      if (isEmpty(oldPassword)) throw new Error("Old password is required");
      if (isEmpty(newPassword)) throw new Error("New password is required");

      await this.checkUserCredentials(login.UserName, oldPassword);

      await api.put(`/UserLogins/${login.Id}`, {
        ...login,
        PlainTextPassword: newPassword,
        IsConfirmed: true,
        EntityTypeId: 27,
      });

      return true;
    } catch (err) {
      throw err;
    }
  }

  async getUserFollowingTopics(userId) {
    try {
      const ignoredTopicObjects = await this.ignoredTopics.find({
        userId,
      });

      const ignoredTopics = ignoredTopicObjects.map(({ topic }) => (topic));

      return difference(FOLLOWABLE_TOPICS, ignoredTopics);
    } catch (err) {
      return FOLLOWABLE_TOPICS;
    }
  }

  ignoreTopic({ userId, topic } = {}) {
    if (!includes(FOLLOWABLE_TOPICS, topic)) throw new Error("Topic cannot be followed");
    return this.ignoredTopics.create({
      _id: Random.id(),
      userId,
      topic,
    });
  }

  followTopic({ userId, topic } = {}) {
    return this.ignoredTopics.remove({
      userId,
      topic,
    });
  }

  async toggleTopic({ userId, topic } = {}) {
    try {
      const isIgnoringTopic = !!await this.ignoredTopics.findOne({ userId, topic });
      if (isIgnoringTopic) {
        return this.followTopic({ userId, topic });
      }
      return this.ignoreTopic({ userId, topic });
    } catch (err) {
      throw err;
    }
  }

  getLocations(personId) {
    return api.get(`/Groups/GetFamilies/${personId}?$expand=GroupLocations,GroupLocations/Location,GroupLocations/GroupLocationTypeValue&$select=Id,GroupLocations/Location/Id,GroupLocations/GroupLocationTypeValue/Value`);
  }

  async updateProfile(personId, { Campus, ...newProfile } = {}) {
    try {
      if (!personId) throw new Error("personId is required!");
      if (Campus) {
        const { id: CampusId } = parseGlobalId(Campus) || {};
        const currentLocations = await this.getLocations(personId);
        const currentLocationId = get(currentLocations, "0.Id");

        // NOTE: Holtzman wasn't considering the
        // case where a currentLocation is undefined.
        // Should it?
        if (currentLocationId) {
          await api.patch(`/Groups/${currentLocationId}`, { CampusId });
        }
      }

      if (!isEmpty(newProfile)) {
        await api.patch(`/People/${personId}`, newProfile);
      }

      return true;
    } catch (err) {
      throw err;
    }
  }

  async updateHomeAddress(personId, newAddress) {
    try {
      const currentLocations = await this.getLocations(personId);
      const homeLocation = get(currentLocations, "0.GroupLocations", []).find(location => (
        location.GroupLocationTypeValue.Value === "Home"
      ));
      const homeLocationId = get(homeLocation, "Location.Id");

      if (homeLocationId) {
        await api.patch(`/Locations/${homeLocationId}`, newAddress);
      } else {
        const Location = {
          ...newAddress,
          Guid: makeNewGuid(),
          IsActive: true,
        };
        const [LocationId, person] = await Promise.all([
          api.post("/Locations", Location),
          this.getUserProfile(personId),
        ]);

        const GroupId = get(currentLocations, "0.Id");
        const GroupLocation = {
          GroupId,
          LocationId,
          GroupLocationTypeValueId: 19, // Home
          IsMailingLocation: true,
          Guid: makeNewGuid(),
          CreatedByPersonAliasId: person.PrimaryAliasId,
          // NOTE: This is required by the rock API but was removed in Holtzman!
          // (new users couldn't create a home address)
          Order: 0,
        };

        await api.post("/GroupLocations", GroupLocation);
      }

      return true;
    } catch (err) {
      throw err;
    }
  }
}

export default {
  User,
};
