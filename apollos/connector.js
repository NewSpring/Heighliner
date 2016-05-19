
import mongoose, { Schema } from "mongoose";
import DataLoader from "dataloader";

const db = mongoose.connect(
  process.env.MONGO_URL || "mongodb://localhost/meteor"
);

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
