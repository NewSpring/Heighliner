import {
  INTEGER,
  STRING,
  CHAR,
} from "sequelize";

import { unserialize } from "php-unserialize";

import { MySQLConnector, Tables } from "../mysql";

const siteSchema: Object = {
  site_id: { type: INTEGER, primaryKey: true },
  site_label: { type: STRING },
  site_name: { type: STRING },
  site_pages: { type: STRING },
};

let Sites;
export {
  Sites,
  siteSchema,
};

export function connect(): Tables {
  Sites = new MySQLConnector("exp_sites", siteSchema);
  
  // helper to parse through the sites pages module
  Sites.parsePage = function (page: string): any {
    return unserialize(new Buffer(page, "base64").toString());
  }
  
  return {
    Sites,
  }
};

export function bind({
  ChannelData,
  Sites,
}: Tables): void {

  
};

export default {
  connect,
  bind,
};