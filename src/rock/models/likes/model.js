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
    return await likes.map(async (like) => {
      return await node.get(like.entryId);
    });
  }

  async toggleLike(nodeId, userId, nodeModel) {
    const entry = await nodeModel.get(nodeId);

    // XXX what should the response be if not a content type?
    if (entry.__type !== "Content") return null;

    const existingLike = await this.model.findOne({
      entryId: entry.entry_id,
      userId,
    });

    if (existingLike) {
      await this.model.remove({
        _id: existingLike._id,
      });
    } else {
      await this.model.create({
        userId,
        entryId: entry.entry_id,
        type: entry.__type,
        createdAt: new Date(),
      });
    }
    await this.cache.del(`${this.__type}:${userId}`);
    return this.getLikedContent(userId, nodeModel);
  }

}

export default {
  Like,
};
