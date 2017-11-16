import crypto from "crypto";
import Bcrypt from "bcrypt";
import Random from "meteor-random";

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

const Model = new MongoConnector("user", schema);

function hashToken(token) {
  return crypto.createHash("sha256")
    .update(token)
    .digest("base64");
}

// METEOR's default token expiration function
function tokenExpiration(when) {
  // We pass when through the Date constructor for backwards compatibility;
  // `when` used to be a number.
  const LOGIN_EXPIRATION_DAYS = 90;
  return new Date((new Date(when)).getTime() + (LOGIN_EXPIRATION_DAYS * 24 * 60 * 60 * 1000));
}

export class User {

  constructor({ cache } = { cache: defaultCache }) {
    this.cache = cache;
    this.model = Model;
  }

  async getFromId(_id, globalId) {
    // try a cache lookup
    return await this.cache.get(globalId, () => this.model.findOne({ _id }));
  }

  async getByHashedToken(token) {
    const rawToken = token;

    // allow for client or server side auth calls
    token = hashToken(token);

    return await this.cache.get(`hashedToken:${token}`, () => this.model.findOne({
      $or: [
        { "services.resume.loginTokens.hashedToken": token },
        { "services.resume.loginTokens.hashedToken": rawToken },
      ],
    }));
  }

  async authorizeUser(email, hashedPassword) {
    const user = await this.model.findOne({
      email,
    });
    if (!user) throw new Error("user not found");

    // METEOR's _checkPassword
    const isValidPassword = Bcrypt.compare(hashedPassword, user.services.password.bcrypt);
    if (!isValidPassword) throw new Error("invalid password");

    // METEOR's _generateStampedLoginToken
    const loginStamp = {
      token: Random.secret(),
      when: new Date(),
    };

    // METEOR's _insertLoginToken
    const hashedLoginStamp = {
      hashedToken: hashToken(loginStamp.token),
      when: loginStamp.when,
    };

    await this.model.update({ _id: user._id }, {
      $addToSet: {
        "services.resume.loginTokens": hashedLoginStamp,
      },
    });

    return {
      id: user.id,
      token: loginStamp.token,
      tokenExpires: tokenExpiration(loginStamp.when),
    };
  }

  async deauthorizeUser(userId, token) {
    this.cache.del(`hashedToken:${token}`); // Not too sure if this works
    await this.model.update({ _id: userId }, {
      $pull: {
        "services.resume.loginTokens": {
          $or: [
            { hashedToken: token },
            { token },
          ],
        },
      },
    });
    return {};
  }
}

export default {
  User,
};
