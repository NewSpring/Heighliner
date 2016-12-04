
import Sequelize, {
  Options,
  Connection,
  Model,
  DefineOptions,
} from "sequelize";

import { merge, isArray } from "lodash";
// import DataLoader from "dataloader";

import { createTables } from "./models";
let noop = (...args) => {}; // tslint:disable-line
let loud = console.log.bind(console, "MYSQL:"); // tslint:disable-line
let db;
let dd;

// MySQL connections
const EESettings = {
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "password",
  database: process.env.MYSQL_DB || "ee_local",
  opts: {
    host: process.env.MYSQL_HOST,
    ssl: process.env.MYSQL_SSL || false,
  }
};

export function connect(monitor) {
  if (db) return Promise.resolve(true);
  dd = monitor && monitor.datadog;
  return new Promise((cb) => {
    const opts = merge({}, EESettings.opts, {
      dialect: "mysql",
      logging: process.env.NODE_ENV !== "production" ? loud : noop, // tslint:disable-line
      benchmark: process.env.NODE_ENV !== "production",
      define: {
        timestamps: false,
        freezeTableName: true,
      },
    });

    db = new Sequelize(EESettings.database, EESettings.user, EESettings.password, opts);

    db.authenticate()
      .then(() => cb(true))
      .then(() => createTables())
      .catch((e) => {
        console.error(e); // tslint:disable-line
        db = false;
        cb(false);
      });
  });
}

export class MySQLConnector {

  prefix = "exp_";
  count = 0;

  constructor(tableName, schema = {}, options = {}) {
    this.db = db;
    options = merge(options, { tableName, underscored: true });
    this.model = db.define(tableName, schema, options);

    // XXX integrate data loader
  }

  find(...args) {
    return this.time(this.model.findAll.apply(this.model, args)
      .then(this.getValues)
      .then(data => data.map(this.mergeData)));
  }

  findOne(...args) {
    return this.time(this.model.findOne.apply(this.model, args)
      .then((x) => x.dataValues)
      .then(this.mergeData));
  }

  mergeData = (data) => {
    const keys = [];
    for (let key in data) {
      if (key.indexOf(this.prefix) > -1) keys.push(key);
    }

     for (let key of keys) {
      const table = data[key];
      if (!data[key]) continue;

      if (isArray(table)) {
        data[key] = this.getValues(table).map(this.mergeData);
      } else if (data[key] && data[key].dataValues) {
        data[key] = this.mergeData(data[key].dataValues);
      }
    }

    return data;
  }

  getValues(data) {
    return data.map(x => x.dataValues)
  }

  queryCount() {
    this.count++;
    return this.count;
  }

  time(promise) {
    const prefix = "MYSQLConnector";
    const count = this.queryCount();
    const start = new Date();
    const label = `${prefix}-${count}`;
    if (dd) dd.increment(`${prefix}.transaction.count`);
    console.time(label); // tslint:disable-line
    return promise
      .then(x => {
        const end = new Date();
        if (dd) dd.histogram(`${prefix}.transaction.time`, (end - start), [""]);
        console.timeEnd(label); // tslint:disable-line
        return x;
      })
      .catch(x => {
        const end = new Date();
        if (dd) dd.histogram(`${prefix}.transaction.time`, (end - start), [""]);
        if (dd) dd.increment(`${prefix}.transaction.error`);
        console.timeEnd(label); // tslint:disable-line
        return x;
      });
  }


}
