/* tslint:disable:no-shadowed-variable */

import { INTEGER, STRING } from "sequelize";
import { unserialize } from "php-unserialize";

import { MySQLConnector, Tables } from "../../mysql";

const siteSchema = {
  site_id: { type: INTEGER, primaryKey: true },
  site_label: { type: STRING },
  site_name: { type: STRING },
  site_pages: { type: STRING },
};

let Sites;
export { Sites, siteSchema };

export function connect() {
  Sites = new MySQLConnector("exp_sites", siteSchema);

  // helper to parse through the sites pages module
  Sites.parsePage = function(page) {
    return unserialize(new Buffer(page, "base64").toString());
  };

  return {
    Sites,
  };
}

// export function bind({
//   ChannelData,
//   Sites,
// }) {

// };

export default {
  connect,
  // bind,
};
