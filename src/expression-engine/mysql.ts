import Sequelize, {
  Options,
  Connection,
  Model,
  DefineOptions,
} from "sequelize";

import { merge, pick, isArray, isObject } from "lodash";
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
      // logging: (...args) => {},
      logging: console.log.bind(console, "MYSQL:"), // use for debugging mysql
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

export interface Tables {
  [key: string]: MySQLConnector;
}

export class MySQLConnector {
  public prefix: string = "exp_"
  public db: Connection;
  public model: Model<any, any>;

  constructor(tableName: string, schema: Object = {}, options: DefineOptions<any> = {}) {
    this.db = db;
    options = merge(options, { tableName, underscored: true });
    this.model = db.define(tableName, schema, options);

    // XXX integrate data loader
  }

  private mergeData = (data: any): any => {
    const keys: string[] = [];
    for (let key in data) {
      if (key.indexOf(this.prefix) > -1) {
        keys.push(key);
      }
    }
    
    for (let key of keys) {
      const table = data[key];
      
      if (isArray(table)) {
        data[key] = this.getValues(table).map(this.mergeData);
      } else if (isObject(table)) {
        data[key] = this.mergeData(data[key].dataValues);
      }
    }
    
    return data;
  }
  
  private getValues(data: any[]): any[] {
    return data.map(x => x.dataValues);
  }

  public find(...args): Promise<Object[]> {
    return this.model.findAll.apply(this.model, args)
      .then(this.getValues)
      .then(data => data.map(this.mergeData));
  }

  public findOne(...args): Promise<Object> {
    return this.model.findOne.apply(this.model, args)
      .then((x) => x.dataValues)
      .then(this.mergeData);
  }

}