import {
  INTEGER,
  STRING,
  CHAR,
} from "sequelize";

import { MySQLConnector, Tables } from "../../mysql";

const naveeSchema: Object = {
  navee_id: { type: INTEGER, primaryKey: true },
  navigation_id: { type: INTEGER },
  site_id: { type: INTEGER },
  entry_id: { type: INTEGER },
  channel_id: { type: INTEGER },
  parent: { type: INTEGER },
  text: { type: STRING },
  link: { type: STRING },
  sort: { type: INTEGER },
  custom: { type: STRING },
  type: { type: STRING },
};

const naveeNavSchema: Object = {
  navigation_id: { type: INTEGER, primaryKey: true },
  site_id: { type: INTEGER },
  nav_title: { type: INTEGER },
  nav_name: { type: INTEGER },
};

let Navee;
let NaveeNav;
export {
  Navee,
  naveeSchema,

  NaveeNav,
  naveeNavSchema,
};

export function connect(): Tables {
  Navee = new MySQLConnector("exp_navee", naveeSchema);
  NaveeNav = new MySQLConnector("exp_navee_navs", naveeNavSchema);

  return {
    Navee,
    NaveeNav,
  }
};

export function bind({
  Sites,
  Navee,
  NaveeNav,
}: Tables): void {

  NaveeNav.model.hasOne(Navee.model, { foreignKey: "navigation_id" });
  Navee.model.belongsTo(NaveeNav.model, { foreignKey: "navigation_id" });

  NaveeNav.model.belongsTo(Sites.model, { foreignKey: "site_id", targetKey: "site_id" });
  Sites.model.hasOne(NaveeNav.model, { foreignKey: "site_id" });

  Navee.model.belongsTo(Sites.model, { foreignKey: "site_id", targetKey: "site_id" });
  Sites.model.hasOne(Navee.model, { foreignKey: "site_id" });
};

export default {
  connect,
  bind,
};