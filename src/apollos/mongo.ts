
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
let dd;
export function connect(address: string, monitor?: any): Promise<boolean> {
  dd = monitor && monitor.datadog;
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
    return this.time(this.model.findOne.apply(this.model, args));
  }

  private time(promise: Promise<any>): Promise<any> {
    const prefix = "MongoConnector";
    const count = this.getCount();
    const start = new Date() as any;
    const label = `${prefix}-${count}`;
    if (dd) dd.increment(`${prefix}.transaction.count`);
    console.time(label); // tslint:disable-line
    return promise
      .then(x => {
        const end = new Date() as any;
        if (dd) dd.histogram(`${prefix}.transaction.time`, (end - start), [""]);
        console.timeEnd(label); // tslint:disable-line
        return x;
      })
      .catch(x => {
        const end = new Date() as any;
        if (dd) dd.histogram(`${prefix}.transaction.time`, (end - start), [""]);
        if (dd) dd.increment(`${prefix}.transaction.error`);
        console.timeEnd(label); // tslint:disable-line
        return x;
      });
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
