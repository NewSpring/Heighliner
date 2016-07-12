/* tslint:disable:no-shadowed-variable */

import {
  INTEGER,
  STRING,
} from "sequelize";

import { MySQLConnector, Tables } from "../../mysql";

const snippetsSchema: Object = {
  snippet_id: { type: INTEGER, primaryKey: true },
  site_id: { type: STRING },
  snippet_name: { type: STRING },
  snippet_contents: { type: STRING },
};

let Snippets;
export {
  Snippets,
  snippetsSchema,
};

export function connect(): Tables {
  Snippets = new MySQLConnector("exp_snippets", snippetsSchema);

  return {
    Snippets,
  };
};

// export function bind({
//   ChannelData,
//   Sites,
// }: Tables): void {


// };

export default {
  connect,
  // bind,
};
