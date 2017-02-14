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

/*
  skip?: Int, // how many to trim off the front
  limit?: Int, // max array size at the end
  arr!: Array, // input array
  emptyRet: any // what to return if array is empty at any point (null, [], {}, etc)
*/
export const safeTrimArray = (skip, limit, arr, emptyRet) => {
  if (!arr || !arr.length) return emptyRet;
  if (skip && skip >= arr.length) return emptyRet; // skips more than we have

  /*
  * first slice: trims the front of the array by "skip"
  * second: trims the back.
  *   it checks for limit, then checks if it would be outside of array bounds
  *     if it's outside of array bounds, just returns whole array
  */
  const trimmed = arr
    .slice(skip ? skip : 0)
    .slice(0, limit ? limit > arr.length ? arr.length : limit : null);

  if (!trimmed || !trimmed.length) return emptyRet;
  return trimmed;
};

export class Like {
  __type = "Like";

  constructor({ cache } = { cache: defaultCache }) {
    this.model = Model;
    this.cache = cache;
  }

  async getFromUserId(userId) {
    const guid = createGlobalId(userId);
    return await this.cache.get(guid, () => this.model.find({ userId }));
  }

  async getLikedContent(userId, node) {
    const likes = await this.getFromUserId(userId);
    return await likes.map(async like => await node.get(like.entryId));
  }

  async getRecentlyLiked({ limit, skip, cache }, userId, nodeModel) {
    const query = userId
      ? { userId: { $ne: userId } }
      : // exlude user if there is one
        {};

    const guid = createGlobalId(`${limit}:${skip}:${userId}`, this.__type);
    const entryIds = await this.cache.get(guid, async () => {
      const ids = await this.model.distinct("entryId", query);
      return safeTrimArray(skip, limit, ids, null);
    });

    if (!entryIds || !entryIds.length) return null;

    const promises = entryIds.map(x => nodeModel.get(x));
    return Promise.all(promises).then(likes => likes.filter(x => x));
  }

  async toggleLike(nodeId, userId, nodeModel) {
    const existingLike = await this.model.findOne({
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

    return {
      like: nodeModel.get(nodeId),
      success: true,
      error: "",
      code: "",
    };
  }
}

export default {
  Like,
};
