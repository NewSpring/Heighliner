import { Cache, defaultCache } from "../../../util/cache";
import { MongoConnector } from "../../mongo";

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
  _id: String,
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

}

export default {
  Like,
};
