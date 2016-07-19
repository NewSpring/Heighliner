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
  public model: MongoConnector;

  constructor() {
    this.model = Model;
  }

  public async getFromUserId(userId: string): Promise<LikeDocument[]> {
    return await this.model.find({ userId }) as LikeDocument[];
  }

}

export default {
  Like,
};
