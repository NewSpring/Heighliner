import crypto from "crypto";

import { MongoConnector } from "../../connectors/mongo";

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

class Users {
  constructor() {
    this.model = Model;
  }

  async getByHashedToken(token) {

    let rawToken = token;

    // allow for client or server side auth calls
    token = crypto.createHash("sha256")
      .update(token)
      .digest("base64");

    return await this.model.findOne({
      $or: [
        { "services.resume.loginTokens.hashedToken": token },
        { "services.resume.loginTokens.hashedToken": rawToken },
      ],
    });
  }
}

export default {
  Users,
};
