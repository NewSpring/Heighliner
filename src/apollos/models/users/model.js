import crypto from "crypto";

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
    token = crypto.createHash("sha256").update(token).digest("base64");

    return await this.cache.get(
      `hashedToken:${token}`,
      () => this.model.findOne({
        $or: [
          { "services.resume.loginTokens.hashedToken": token },
          { "services.resume.loginTokens.hashedToken": rawToken },
        ],
      }),
    );
  }
}

export default {
  User,
};
