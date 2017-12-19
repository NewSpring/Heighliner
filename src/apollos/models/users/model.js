import crypto from "crypto";
import moment from "moment";
import stripTags from "striptags";
import Random from "meteor-random";
import omit from "lodash/omit";
import isEmpty from "lodash/isEmpty";
import makeNewGuid from "./makeNewGuid";
import sendEmail from "./sendEmail";
import * as api from "./api";
import { encrypt, decrypt } from "./securityUtils";

import { MongoConnector } from "../../mongo";
import { defaultCache } from "../../../util/cache";

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
  userId: Number,
  createdAt: { type: Date, default: Date.now },
}, [
  {
    keys: { createdAt: 1 },
    options: { expireAfterSeconds: 43200 }, // 1 day
  },
]);

export class User {
  // Deprecate
  constructor({ cache } = { cache: defaultCache }) {
    this.cache = cache;
    this.model = UserModel;
    this.tokens = UserTokensModel;
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
      const username = decrypt(decodeURIComponent(userPasswordTuple[0]));
      const password = decrypt(decodeURIComponent(userPasswordTuple[1]));

      const isAuthorized = await this.checkUserCredentials(username, password);
      if (!isAuthorized) throw new Error("User not authorized");

      return this.getLatestLoginByUsername(username);
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
      const { userId } = await this.tokens.findOne({
        token,
        type,
      });

      return this.getLoginById(userId);
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

  loginUser = async ({ email, password } = {}) => {
    try {
      await this.checkUserCredentials(email, password);

      const login = await this.getLatestLoginByUsername(email);

      if (!login.IsConfirmed) {
        api.post(`/UserLogins/${login.Id}`, {
          IsConfirmed: true,
        });
      }

      api.patch(`/UserLogins/${login.Id}`, {
        LastLoginDateTime: `${moment().toISOString()}`,
      });

      return {
        id: login.Id,
        token: `${encodeURIComponent(encrypt(email))}:${encodeURIComponent(encrypt(password))}`,
      };
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

  createUserLogin(props = {}) {
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

      const userLoginId = await this.createUserLogin({
        email,
        password,
        personId,
      });

      const [user, person] = await Promise.all([
        api.get(`/UserLogins/${userLoginId}`),
        api.get(`/People/${personId}`),
      ]);

      // Removed saving it to a constant
      // because we don't know if this ID could change
      // from other sources (migrations, integrity checks, etc)
      const [systemEmail] = await api.get("/SystemEmails?$filter=Title eq 'Account Created'");
      if (!systemEmail) throw new Error("Account created email does not exist!");

      // await sendEmail(
      //   systemEmail.Id,
      //   Number(person.PrimaryAliasId),
      //   {
      //     Person: person,
      //     User: user,
      //   },
      // );

      return this.loginUser({ email, password });
    } catch (err) {
      throw err;
    }
  }

  forgotPassword = async (username, sourceURL) => {
    try {
      const user = await this.getLatestLoginByUsername(username);
      if (!user) throw new Error("User does not exist!");

      const person = await api.get(`/People/${user.PersonId}`);
      if (!person) throw new Error("User profile does not exist!");

      const token = Random.secret();

      // NOTE: I didn't want to have to use Mongo
      // but I can't write directly to rock or have
      // rock manage password reset tokens. This works fine for now ^_^
      await this.tokens.create({
        _id: Random.id(),
        userId: user.Id,
        token,
        type: "reset",
      });

      // const [systemEmail] = await api.get("/SystemEmails?$filter=Title eq 'Reset Password'");
      // if (!systemEmail) throw new Error("Reset password email does not exist!");

      // await sendEmail(
      //   systemEmail.Id,
      //   Number(person.PrimaryAliasId),
      //   {
      //     Person: person,
      //     ResetPasswordUrl: `${sourceURL}/reset-password/${token}`,
      //   },
      // );
      return user;
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
        userId: user.Id,
        token,
        type: "reset",
      });

      return this.loginUser({ email: user.UserName, password: newPassword });
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

      await api.put(`/UserLogins/${user.Id}`, {
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
