import Sequelize, {
  Options,
  Connection,
  Model,
  DefineOptions,
} from "sequelize";

import { merge } from "lodash";
// import DataLoader from "dataloader";

import { createTables } from "./tables";

let db;
export function connect(
  database: string,
  username: string,
  password: string,
  opts: Options
): Promise<boolean> {
  return new Promise((cb) => {
    opts = merge({}, opts, {
      dialect: "mysql",
      logging: console.log.bind(console, "MYSQL:"),
      define: {
        timestamps: false,
        freezeTableName: true,
      }
    });

    db = new Sequelize(database, username, password, opts);

    db.authenticate()
      .then(() => cb(true))
      .then(() => createTables())
      .catch(() => cb(false));
  });
}

export class MySQLConnector {
  public db: Connection;
  public model: Model<any, any>;

  constructor(tableName: string, schema: Object = {}, options: DefineOptions<any> = {}) {
    this.db = db;
    options = merge(options, { tableName });
    this.model = db.define(tableName, schema, options);

    // XXX integrate data loader
  }

  public find(...args): Promise<Object[]> {
    return this.model.findAll.apply(this.model, args);
  }

}
