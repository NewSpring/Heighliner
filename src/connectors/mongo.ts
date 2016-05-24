
import mongoose, {
  Schema,
  Connection,
  Model,
  Document,
} from "mongoose";
// import DataLoader from "dataloader";

let db;

export function connect(address: string): Promise<boolean> {
  return new Promise((cb) => {

    db = mongoose.connect(address, (err) => {
      if (err) { cb(false); return; }

      cb(true);
      return;
    });

  });
}

mongoose.connection.on("error",
  console.error.bind(console, "MONGO connection error:")
);

export class MongoConnector {
  public db: Connection;
  public model: Model<Document>;

  constructor(collection: string, schema: Object = {}) {
    this.db = db;
    this.model = mongoose.model(collection, new Schema(schema));

    // XXX integrate data loader
  }

  public findOne(...args): Object {
    return this.model.findOne(args);
  }

}
