import { Cache, defaultCache } from "../../../util/cache";
import { MongoConnector } from "../../mongo";
import { parseGlobalId, createGlobalId } from "../../../util/node/model";

export interface LikeDocument {
  _id: string;
  userId: string;
  entryId: string;
  type: string;
  createdAt: Date;
}

const schema: Object = {
  userId: String,
  entryId: String,
  type: String,
  createdAt: String,
};

const Model = new MongoConnector("like", schema);

export class Like {
  public __type: string = "Like";
  public model: MongoConnector;
  public cache: Cache;

  constructor({ cache }: { cache: Cache | any } = { cache: defaultCache }) {
    this.model = Model;
    this.cache = cache;
  }

  public async getFromUserId(userId: string): Promise<LikeDocument[]> {
    return await this.cache.get(`${this.__type}:${userId}`, () => (
      this.model.find({ userId })
    )) as LikeDocument[];
  }

  public async getLikedContent(userId: string, contentModel: any): Promise<any[]> {
    const likes = await this.getFromUserId(userId);
    return await likes.map(async (like) => {
      const guid = createGlobalId(like.entryId, like.type);
      return await contentModel.getFromId(like.entryId, guid);
    });
  }

  public async toggleLike(contentId: string, userId: string, contentModel: any): Promise<any[]> {
    const entry = parseGlobalId(contentId);
    // XXX what should the response be if not a content type?
    if (entry.__type !== "Content") return null;

    const existingLike = await this.model.findOne({
      entryId: entry.id,
      userId,
    }) as LikeDocument;

    if (existingLike) {
      await this.model.remove({
        _id: existingLike._id,
      });
    } else {
      await this.model.create({
        userId,
        entryId: entry.id,
        type: entry.__type,
        createdAt: new Date(),
      });
    }
    await this.cache.del(`${this.__type}:${userId}`);
    return this.getLikedContent(userId, contentModel);
  }

}

export default {
  Like,
};
