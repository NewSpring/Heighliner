
import mongoose, { Schema } from "mongoose";
import DataLoader from "dataloader";

let db;

export async function connect(...args) {
  return await new Promise((cb) => {

    db = mongoose.connect(args, (err) => {
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
  constructor(collection, schema = {}) {
    this.db = db;
    this.model = mongoose.model(collection, new Schema(schema));

    // this.loader =
  }

  findOne(...args) {
    return this.model.findOne(args);
  }

}
