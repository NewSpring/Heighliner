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
let loud = console.log.bind(console, "MSSQL:"); // tslint:disable-line
let db;
let dd;

export function connect(database, username, password, opts, monitor) {
  dd = monitor && monitor.datadog;
  return new Promise((cb) => {
    opts = merge({}, opts, {
      dialect: "mssql",
      logging: process.env.NODE_ENV !== "production" ? loud : noop, // tslint:disable-line
      benchmark: process.env.NODE_ENV !== "production",
      dialectOptions: {
        readOnlyIntent: true,
      },
      define: {
        timestamps: false,
        freezeTableName: true,
      },
    });

    db = new Sequelize(database, username, password, opts);

    db.authenticate()
      .then(() => cb(true))
      .then(() => createTables())
      .catch((e) => {
        console.error(e); // tslint:disable-line
        cb(false);
      });
  });
}

export class MSSQLConnector {
  prefix = "";
  count = 0;

  constructor(tableName, schema = {}, options = {}, api) {
    this.db = db;
    options = merge(options, { tableName, underscored: true });
    this.model = db.define(tableName, schema, options);

    if (api) this.route = api;
    // rock's api uses a plural of the table name
    if (!api) this.route = `${tableName}s`;
    // XXX integrate data loader
  }

  find(...args) {
    // console.log("finding", args)
    return this.time(this.model.findAll.apply(this.model, args)
      .then(this.getValues)
      .then(data => data.map(this.mergeData)));
  }

  findOne(...args) {
    return this.time(this.model.findOne.apply(this.model, args)
      .then((x) => x && x.dataValues)
      .then(this.mergeData));
  }

  patch(entityId = "", body) {
    return this.fetch("PATCH", `${entityId}`, body);
  }

  post(body) {
    return this.fetch("POST", "", body);
  }

  delete(entityId) {
    return this.fetch("DELETE", `${entityId}`);
  }

  fetch(method, route = "", body) {
    const { ROCK_URL, ROCK_TOKEN } = process.env;
    const headers = {
      "Authorization-Token": ROCK_TOKEN,
      "Content-Type": "application/json",
    };

    return fetch(`${ROCK_URL}api/${this.route}`, {
      headers, method, body: JSON.stringify(body),
    })
      .then(response => {
        const { status, statusText, error } = response;

        if (status === 204) return { json: () => ({ status: 204, statusText: "success" })};
        if (status >= 200 && status < 300) return response;

        return {
          json: () => ({ status, statusText, error: error() }),
        };
      })
      .then(x => x.json());
  }

  mergeData = (data) => {
    if (!data) return data;

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
    return data.map(x => x.dataValues || x);
  }

  queryCount() {
    this.count++;
    return this.count;
  }

  time(promise) {
    const prefix = "MSSQLConnector";
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
