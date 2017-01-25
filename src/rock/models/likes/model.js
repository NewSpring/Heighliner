
import uuid from "node-uuid";
import { Cache, defaultCache } from "../../../util/cache";
import { MongoConnector } from "../../../apollos/mongo";
import { createGlobalId } from "../../../util/node/model";

const schema = {
  _id: String,
  userId: String,
  entryId: String,
  type: String,
  createdAt: String,
};

const Model = new MongoConnector("like", schema);

export class Like {
  __type = "Like";

  constructor({ cache } = { cache: defaultCache }) {
    this.model = Model;
    this.cache = cache;
  }

  async getFromUserId(userId) {
    const guid = createGlobalId(userId);
    return await this.cache.get(guid, () => (
      this.model.find({ userId })
    ));
  }

  async getLikedContent(userId, node) {
    const likes = await this.getFromUserId(userId);
    return await likes.map(async (like) => {
      return await node.get(like.entryId);
    });
  }

  async getRecentlyLiked({ limit, skip, cache }, userId, nodeModel) {
    const query = userId
      ? { userId: { $ne: userId } }
      : { };

    const guid = createGlobalId(`${limit}:${skip}:${userId}`, this.__type);
    const entryIds = await this.cache.get(guid, async () => {
      const ids = await this.model.distinct("entryId", query);
      if(skip && skip >= ids.length) return null; // skips more than we have

      /*
      * first slice: trims the front of the array by "skip"
      * second: trims the back.
      *   it checks for limit, then checks if it would be outside of array bounds
      *     if it's outside of array bounds, just returns whole array
      */
      return ids
        .slice(skip ? skip : 0)
        .slice(0, limit ? (limit > ids.length ? ids.length : limit): null);
    });

    if(!entryIds || !entryIds.length) return null;
    return entryIds.map(like => nodeModel.get(like));
  }

  async toggleLike(nodeId, userId, nodeModel) {
    let existingLike = await this.model.findOne({
      entryId: nodeId,
      userId,
    });

    if (existingLike) {
      await this.model.remove({
        _id: existingLike._id,
      });
    } else {
      await this.model.create({
        _id: uuid.v4(),
        userId,
        entryId: nodeId,
        createdAt: new Date(),
      });
    }

    const guid = createGlobalId(userId);
    await this.cache.del(guid);

    return ({
      like: nodeModel.get(nodeId),
      success: true,
      error: "",
      code: "",
    });
  }

}

export default {
  Like,
};
