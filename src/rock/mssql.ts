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

export function connect(
  database: string,
  username: string,
  password: string,
  opts: Options,
  monitor?: any
): Promise<boolean> {
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

export interface Tables {
  [key: string]: MSSQLConnector;
}

export class MSSQLConnector {
  public prefix: string = "";
  public db: Connection;
  public model: Model<any, any>;
  public route: string;
  private count: number = 0;

  constructor(tableName: string, schema: Object = {}, options: DefineOptions<any> = {}, api?: string) {
    this.db = db;
    options = merge(options, { tableName, underscored: true });
    this.model = db.define(tableName, schema, options);

    if (api) this.route = api;
    // rock's api uses a plural of the table name
    if (!api) this.route = `${tableName}s`;
    // XXX integrate data loader
  }

  public find(...args): Promise<Object[]> {
    // console.log("finding", args)
    return this.time(this.model.findAll.apply(this.model, args)
      .then(this.getValues)
      .then(data => data.map(this.mergeData)));
  }

  public findOne(...args): Promise<Object> {
    return this.time(this.model.findOne.apply(this.model, args)
      .then((x) => x && x.dataValues)
      .then(this.mergeData));
  }

  public patch(body: Object): Promise<number | boolean | Object> {
    return this.fetch("PATCH", body);
  }

  public put(body: Object): Promise<number | boolean | Object> {
    return this.fetch("PUT", body);
  }

  public post(body: Object): Promise<number | boolean | Object> {
    return this.fetch("POST", body);
  }

  private fetch(method: string, body: Object): Promise<number | boolean | Object> {
    const { ROCK_URL, ROCK_TOKEN } = process.env;
    const headers = {
      "Authorization-Token": ROCK_TOKEN,
      "Content-Type": "application/json",
    } as { [index: string]: string; };

    return fetch(`${ROCK_URL}api/${this.route}`, {
      headers, method, body: JSON.stringify(body),
    })
      .then(response => {
        const { status, statusText, error } = response;

        if (status === 204) return { json() { return true; } };
        if (status >= 200 && status < 300) return response;

        return {
          json: () => ({ status, statusText, error: error() }),
        };
      })
      .then(x => x.json());
  }

  private mergeData = (data: any): any => {
    if (!data) return data;

    const keys: string[] = [];
    for (let key in data) {
      if (key.indexOf(this.prefix) > -1) {
        keys.push(key);
      }
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

  private getValues(data: any[]): any[] {
    return data.map(x => x.dataValues || x);
  }

  private queryCount(): number {
    this.count++;
    return this.count;
  }

  private time(promise: Promise<any>): Promise<any> {
    const prefix = "MSSQLConnector";
    const count = this.queryCount();
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

}
