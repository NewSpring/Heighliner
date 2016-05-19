import crypto from "crypto";

import { MongoConnector } from "../connector";

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

const model = new MongoConnector("user", schema);

class Users {
  constructor({ hashedToken }) {
    this.connector = model;

    // on query, get the current user
    // then you can get the logged in user by
    // ctx.connectors.Users.currentUser
    this.currentUser = null;
    if (hashedToken) {
      this.currentUser = this.getByHashedToken(hashedToken);
    }

  }

  async getByHashedToken(token) {

    let rawToken = token;

    // allow for client or server side auth calls
    token = crypto.createHash('sha256')
      .update(token)
      .digest('base64');

    return await this.connector.findOne({
      $or: [
        { "services.resume.loginTokens.hashedToken": token },
        { "services.resume.loginTokens.hashedToken": rawToken },
      ],
    });
  }
}

export default {
  Users,
}
