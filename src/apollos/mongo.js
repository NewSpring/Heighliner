
import mongoose, { Schema } from "mongoose";
// import DataLoader from "dataloader";

let db;
let dd;
export function connect(address, monitor) {
  dd = monitor && monitor.datadog;
  return new Promise((cb) => {
    db = mongoose.connect(address, {
      server: { reconnectTries: Number.MAX_VALUE },
    }, (err) => {
      if (err) { cb(false); return; }

      cb(true);
    });
  });
}

mongoose.connection.on("error",
  console.error.bind(console, "MONGO connection error:"),
);

export class MongoConnector {
  constructor(collection, schema) {
    this.db = db;
    this.model = mongoose.model(collection, new Schema(schema));

    // XXX integrate data loader
  }

  findOne(...args) {
    return this.time(this.model.findOne.apply(this.model, args));
  }

  time(promise) {
    const prefix = "MongoConnector";
    const count = this.getCount();
    const start = new Date();
    const label = `${prefix}-${count}`;
    if (dd) dd.increment(`${prefix}.transaction.count`);
    console.time(label);
    return promise
      .then((x) => {
        const end = new Date();
        if (dd) dd.histogram(`${prefix}.transaction.time`, (end - start), [""]);
        console.timeEnd(label);
        return x;
      })
      .catch((x) => {
        const end = new Date();
        if (dd) dd.histogram(`${prefix}.transaction.time`, (end - start), [""]);
        if (dd) dd.increment(`${prefix}.transaction.error`);
        console.timeEnd(label);
        return x;
      });
  }

  getCount() {
    this.count++;
    return this.count;
  }
}
