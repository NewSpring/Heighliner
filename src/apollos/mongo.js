import mongoose, { Schema } from "mongoose";
// import DataLoader from "dataloader";
mongoose.Promise = global.Promise;

let db = mongoose.connect(
  process.env.MONGO_URL,
  {
    server: { reconnectTries: Number.MAX_VALUE }
  }
);
let dd;

// NOTE: Wherever this is called it's too late in the game for
// use to take advantage of indexing
export function connect(monitor) {
  if (db) return Promise.resolve(true);
  dd = monitor && monitor.datadog;
  return new Promise(cb => {
    db = mongoose.connect(
      process.env.MONGO_URL,
      {
        server: { reconnectTries: Number.MAX_VALUE }
      },
      err => {
        if (err) {
          db = false;
          cb(false);
          return;
        }

        cb(true);
      }
    );
  });
}

mongoose.connection.on(
  "error",
  console.error.bind(console, "MONGO connection error:")
);

export class MongoConnector {
  constructor(collection, schema, indexes = []) {
    this.db = db;
    this.schema = new Schema(schema);
    indexes.forEach(({ keys, options } = {}) =>
      this.schema.index(keys, options)
    );
    this.model = mongoose.model(collection, this.schema);
    this.count = 0;

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
      .then(x => {
        const end = new Date();
        if (dd) dd.histogram(`${prefix}.transaction.time`, end - start, [""]);
        console.timeEnd(label);
        return x;
      })
      .catch(x => {
        const end = new Date();
        if (dd) dd.histogram(`${prefix}.transaction.time`, end - start, [""]);
        if (dd) dd.increment(`${prefix}.transaction.error`);
        console.timeEnd(label);
        return x;
      });
  }

  find(...args) {
    const label = `MongoConnector${this.getCount()}`;
    console.time(label);
    return this.model.find.apply(this.model, args).then(x => {
      console.timeEnd(label);
      return x;
    });
  }

  remove(...args) {
    const label = `MongoConnector${this.getCount()}`;
    console.time(label);
    return this.model.remove.apply(this.model, args).then(x => {
      console.timeEnd(label);
      return x;
    });
  }

  create(...args) {
    const label = `MongoConnector${this.getCount()}`;
    console.time(label);
    return this.model.create.apply(this.model, args).then(x => {
      console.timeEnd(label);
      return x;
    });
  }

  distinct(field, query) {
    const label = `MongoConnector${this.getCount()}`;
    console.time(label);
    return this.model.distinct(field, query).then(x => {
      console.timeEnd(label);
      return x;
    });
  }

  aggregate(...args) {
    return this.model.aggregate(...args);
  }

  getCount() {
    this.count++;
    return this.count;
  }
}
