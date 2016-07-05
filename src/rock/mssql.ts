import Sequelize, {
  Options,
  Connection,
  Model,
  DefineOptions,
} from "sequelize";


import { merge, isArray } from "lodash";
// import DataLoader from "dataloader";

import { createTables } from "./models";

let db;
export function connect(
  database: string,
  username: string,
  password: string,
  opts: Options
): Promise<boolean> {
  return new Promise((cb) => {
    opts = merge({}, opts, {
      dialect: "mssql",
      // logging: (...args) => {}, // tslint:disable-line
      logging: console.log.bind(console, "MSSQL:"), // tslint:disable-line
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

  private count: number = 0;

  constructor(tableName: string, schema: Object = {}, options: DefineOptions<any> = {}) {
    this.db = db;
    options = merge(options, { tableName, underscored: true });
    this.model = db.define(tableName, schema, options);

    // XXX integrate data loader
  }

  public find(...args): Promise<Object[]> {
    return this.time(this.model.findAll.apply(this.model, args)
      .then(this.getValues)
      .then(data => data.map(this.mergeData)));
  }

  public findOne(...args): Promise<Object> {
    return this.time(this.model.findOne.apply(this.model, args)
      .then((x) => x && x.dataValues)
      .then(this.mergeData));
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
    const label = `MSSQLConnector-${this.queryCount()}`;
    console.time(label); // tslint:disable-line
    return promise
      .then(x => { console.timeEnd(label); return x}) // tslint:disable-line
      .catch(x => { console.timeEnd(label); return x}) // tslint:disable-line
      ;
  }

}
