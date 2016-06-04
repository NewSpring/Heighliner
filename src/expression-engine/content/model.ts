import { merge, pick } from "lodash";

import { Cache, defaultCache } from "../../util/cache";
import {
  Channels,
  channelSchema,
  ChannelData,
  channelDataSchema,
  ChannelTitles,
  channelTitleSchema,
} from "../tables/channels";

export class Content {
  private cache: Cache

  constructor({ cache } = { cache: defaultCache }) {
    this.cache = cache;
  }

  async find(query: any = {}) {
    const { limit, offset } = query; // true options
    delete query.limit;
    delete query.offset;

    // channel data fields
    const channelDataFields = pick(query,  Object.keys(channelDataSchema));
    const channelFields = pick(query, Object.keys(channelSchema));
    const channelTitleFields = pick(query, Object.keys(channelTitleSchema));

    return await ChannelData.find(merge({
      include: [
        {
          model: Channels.model,
          where: channelFields,
        },
        {
          model: ChannelTitles.model,
          where: channelTitleFields,
        }
    ],
    }, { where: channelDataFields }, { limit, offset }))
      .then((data) => data.map(x => x.dataValues))
      .then((data) => data.map(x => {
        x.exp_channel = x.exp_channel.dataValues;
        return x;
      }));
      .then((data) => data.map(x => {
        x.exp_channel_title = x.exp_channel_title.dataValues;
        return x;
      }));
  }
}
// export class User {
//   private model: MongoConnector
//   private cache: Cache
//
//   constructor({ cache } = { cache: defaultCache }) {
//     this.cache = cache;
//     this.model = Model;
//   }
//
//   async getFromId(_id: string): Promise<UserDocument> {
//     // try a cache lookup
//     return await this.cache.get(_id, () => this.model.findOne({ _id })) as UserDocument;
//   }
//
//   async getByHashedToken(token: string): Promise<UserDocument> {
//     let rawToken = token;
//
//     // allow for client or server side auth calls
//     token = crypto.createHash("sha256")
//       .update(token)
//       .digest("base64");
//
//     return await this.model.findOne({
//       $or: [
//         { "services.resume.loginTokens.hashedToken": token },
//         { "services.resume.loginTokens.hashedToken": rawToken },
//       ],
//     }) as UserDocument;
//   }
// }

export default {
  Content,
};
