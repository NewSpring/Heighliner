
import mongoose, {
  Schema,
  Connection,
  Model,
  Document,
} from "mongoose";
// import DataLoader from "dataloader";

// Use native promises
// XXX typscript throws an error here
// mongoose.Promise = global.Promise;

let db;

export function connect(address: string): Promise<boolean> {
  return new Promise((cb) => {

    db = mongoose.connect(address, {
      server: { reconnectTries: Number.MAX_VALUE },
    }, (err) => {
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

  private count: number = 0;

  constructor(collection: string, schema: Object = {}) {
    this.db = db;
    this.model = mongoose.model(collection, new Schema(schema));

    // XXX integrate data loader
  }

  public findOne(...args): Promise<Object> {
    const label = `MongoConnector${this.getCount()}`;
    console.time(label); // tslint:disable-line
    return this.model.findOne.apply(this.model, args)
      .then(x => { console.timeEnd(label); return x; });  // tslint:disable-line
  }

  public find(...args): Promise<Object> {
    const label = `MongoConnector${this.getCount()}`;
    console.time(label); // tslint:disable-line
    return this.model.find.apply(this.model, args)
      .then(x => { console.timeEnd(label); return x; }); // tslint:disable-line
  }



  private getCount(): number {
    this.count++;
    return this.count;
  }

}
