import { Cache, defaultCache } from "../../../util/cache";
import { MongoConnector } from "../../../apollos/mongo";
import { parseGlobalId, createGlobalId } from "../../../util/node/model";

const schema = {
  userId: String,
  entryId: String,
  type: String,
  createdAt: String,
};

const Model = new MongoConnector("like", schema);

export class Like {
  __type = "Like";

  constructor({ cache } = { cache }) {
    this.model = Model;
    this.cache = cache;
  }

  async getFromUserId(userId) {
    // return await this.cache.get(`${this.__type}:${userId}`, () => (
    //   this.model.find({ userId })
    // ));
    // XXX Turn caching back on
    return this.model.find({ userId })
  }

  async getLikedContent(userId, node) {
    const likes = await this.getFromUserId(userId);
    console.log("likes", likes);
    return await likes.map(async (like) => {
      return await node.get(like.entryId);
    });
  }

  // public async toggleLike(nodeId: string, userId: string, contentModel: any): Promise<any[]> {
  //   const entry = parseGlobalId(nodeId);
  //   // XXX what should the response be if not a content type?
  //   if (entry.__type !== "Content") return null;
  //
  //   const existingLike = await this.model.findOne({
  //     entryId: entry.id,
  //     userId,
  //   }) as LikeDocument;
  //
  //   if (existingLike) {
  //     await this.model.remove({
  //       _id: existingLike._id,
  //     });
  //   } else {
  //     await this.model.create({
  //       userId,
  //       entryId: entry.id,
  //       type: entry.__type,
  //       createdAt: new Date(),
  //     });
  //   }
  //   await this.cache.del(`${this.__type}:${userId}`);
  //   return this.getLikedContent(userId, contentModel);
  // }

}

export default {
  Like,
};
