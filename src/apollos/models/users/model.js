import crypto from "crypto";
import moment from "moment";
import stripTags from "striptags";
import Random from "meteor-random";
import omit from "lodash/omit";
import isEmpty from "lodash/isEmpty";
import makeNewGuid from "./makeNewGuid";
import sendEmail from "./sendEmail";
import * as api from "./api";

import { MongoConnector } from "../../mongo";
import { defaultCache } from "../../../util/cache";

const schema = {
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
};

// Needs migration
const Model = new MongoConnector("user", schema);

export class User {
  // Deprecate
  constructor({ cache } = { cache: defaultCache }) {
    this.cache = cache;
    this.model = Model;
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

  async getByBasicAuth(userPasswordString = "") {
    // Client needs to encode user and password and join by ':'
    // for all user requests including login
    try {
      const userPasswordTuple = userPasswordString.split(":");
      const username = decodeURIComponent(userPasswordTuple[0]);
      const password = decodeURIComponent(userPasswordTuple[1]);

      const isAuthorized = await this.checkUserCredentials(username, password);
      if (!isAuthorized) throw new Error("User not authorized");

      return this.getByUsername(username);
    } catch (err) {
      throw err;
    }
  }

  async getByUsername(username = "") {
    const [user] = await api.get(`/UserLogins?$filter=UserName eq '${username}'`);
    return user;
  }

  async getByToken(token = "") {
    const [user] = await api.get(`/UserLogins?$filter=ResetPasswordToken eq '${token}'`);
    return user;
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

  loginUser = async ({ email, password } = {}) => {
    try {
      await this.checkUserCredentials(email, password);

      const user = await this.getByUsername(email);

      if (!user.IsConfirmed) {
        api.post(`/UserLogins/${user.Id}`, {
          IsConfirmed: true,
        });
      }

      api.patch(`/UserLogins/${user.Id}`, {
        LastLoginDateTime: `${moment().toISOString()}`,
      });

      return user;
    } catch (err) {
      throw err;
    }
  }

  createUserProfile(props = {}) {
    const {
      email,
      firstName,
      lastName,
    } = props;

    return api.post("/People", {
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
  }

  createUser(props = {}) {
    const {
      email,
      password,
      personId,
    } = props;

    return api.post("/UserLogins", {
      PersonId: personId,
      EntityTypeId: 27,
      UserName: email,
      IsConfirmed: true,
      PlainTextPassword: password,
      LastLoginDateTime: `${moment().toISOString()}`,
    });
  }

  async registerUser(props = {}) {
    try {
      const {
        email,
        firstName,
        lastName,
        password,
      } = props;

      const personId = await this.createUserProfile({
        email,
        firstName,
        lastName,
      });

      const userId = await this.createUser({
        email,
        password,
        personId,
      });

      const [user, person] = await Promise.all([
        api.get(`/UserLogins/${userId}`),
        api.get(`/People/${personId}`),
      ]);

      // Removed saving it to a constant
      // because we don't know if this ID could change
      // from other sources (migrations, integrity checks, etc)
      const [systemEmail] = await api.get("/SystemEmails?$filter=Title eq 'Account Created'");
      if (!systemEmail) throw new Error("Account created email does not exist!");

      await sendEmail(
        systemEmail.Id,
        Number(person.PrimaryAliasId),
        {
          Person: person,
          User: user,
        },
      );

      return user;
    } catch (err) {
      throw err;
    }
  }

  async forgotPassword(username, sourceURL) {
    try {
      const user = await this.getByUsername(username);
      if (!user) throw new Error("User does not exist!");

      const person = await api.get(`People/${user.PersonId}`);
      if (!person) throw new Error("User profile does not exist!");

      const token = Random.secret();

      // Not sure if I can do this (also can't expire this way until after use)
      await api.put(`UserLogins/${user.Id}`, {
        ...user,
        ResetPasswordToken: token,
      });

      const [systemEmail] = await api.get("/SystemEmails?$filter=Title eq 'Reset Password'");
      if (!systemEmail) throw new Error("Reset password email does not exist!");

      await sendEmail(
        systemEmail.Id,
        Number(person.PrimaryAliasId),
        {
          Person: person,
          ResetPasswordUrl: `${sourceURL}/reset-password/${token}`,
        },
      );
      return user;
    } catch (err) {
      throw err;
    }
  }

  async resetPassword(token, newPassword) {
    try {
      const user = await this.getByToken(token);
      if (!user) throw new Error("Token user not found!");
      if (isEmpty(newPassword)) throw new Error("New password is required");

      await api.put(`UserLogins/${user.Id}`, {
        ...omit(user, "ResetPasswordToken"),
        PlainTextPassword: newPassword,
        IsConfirmed: true,
        EntityTypeId: 27,
      });
      return user;
    } catch (err) {
      throw err;
    }
  }

  async changePassword(user, oldPassword, newPassword) {
    try {
      if (!user) throw new Error("User is not logged in!");
      if (isEmpty(oldPassword)) throw new Error("Old password is required");
      if (isEmpty(newPassword)) throw new Error("New password is required");

      const isAuthorized = await this.checkUserCredentials(user.UserName, oldPassword);
      if (!isAuthorized) throw new Error("User not authorized");

      await api.put(`UserLogins/${user.Id}`, {
        ...omit(user, "ResetPasswordToken"),
        PlainTextPassword: newPassword,
        IsConfirmed: true,
        EntityTypeId: 27,
      });
      return user;
    } catch (err) {
      throw err;
    }
  }
}

export default {
  User,
};
