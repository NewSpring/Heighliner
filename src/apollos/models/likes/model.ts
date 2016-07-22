import { Cache, defaultCache } from "../../../util/cache";
import { MongoConnector } from "../../mongo";
import { parseGlobalId } from "../../../util/node/model";

export interface LikeDocument {
  _id: string;
  userId: string;
  entryId: string;
  title: string;
  image: string;
  link: string;
  icon: string;
  category: string;
  date: Date;
  status: string;
  dateLiked: Date;
}

const schema: Object = {
  userId: String,
  entryId: String,
  title: String,
  image: String,
  link: String,
  icon: String,
  category: String,
  date: Date,
  status: String,
  dateLiked: Date,
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

  public async toggleLike(contentId: string, userId: string): Promise<LikeDocument[]> {
    const entry = parseGlobalId(contentId);
    // XXX what should the response be if not a content type?
    if (entry.__type !== "Content") return [];

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
      });
    }
    await this.cache.del(`${this.__type}:${userId}`);
    return this.getFromUserId(userId);
  }

}

export default {
  Like,
};
