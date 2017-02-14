/* tslint:disable:no-shadowed-variable */

import { INTEGER, STRING } from "sequelize";

import { MySQLConnector } from "../../mysql";

const snippetsSchema = {
  snippet_id: { type: INTEGER, primaryKey: true },
  site_id: { type: STRING },
  snippet_name: { type: STRING },
  snippet_contents: { type: STRING },
};

let Snippets;
export { Snippets, snippetsSchema };

export function connect() {
  Snippets = new MySQLConnector("exp_snippets", snippetsSchema);

  return {
    Snippets,
  };
}

// export function bind({
//   ChannelData,
//   Sites,
// }): void {

// };

export default {
  connect,
  // bind,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
};
