/* tslint:disable:no-shadowed-variable */

import { INTEGER, STRING } from "sequelize";

import { MySQLConnector, Tables } from "../../mysql";

const playaSchema = {
  rel_id: { type: INTEGER, primaryKey: true },
  parent_entry_id: { type: INTEGER },
  parent_field_id: { type: INTEGER },
  parent_col_id: { type: INTEGER },
  parent_row_id: { type: INTEGER },
  parent_var_id: { type: INTEGER },
  parent_element_id: { type: STRING },
  child_entry_id: { type: INTEGER },
  rel_order: { type: INTEGER }
};
let Playa;
export { Playa, playaSchema };

export function connect() {
  Playa = new MySQLConnector("exp_playa_relationships", playaSchema);

  return {
    Playa
  };
}

export function bind({ ChannelData, Playa }) {
  // get access to matrix from channel data
  ChannelData.model.hasMany(Playa.model, { foreignKey: "entry_id" });
  Playa.model.belongsTo(ChannelData.model, { foreignKey: "entry_id" });
}

export default {
  connect,
  bind
};
