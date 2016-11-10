/* tslint:disable:no-shadowed-variable */

import {
  INTEGER,
  STRING,
} from "sequelize";

import { MySQLConnector } from "../../mysql";

const naveeSchema = {
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

const naveeNavSchema = {
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

export function connect() {
  Navee = new MySQLConnector("exp_navee", naveeSchema);
  NaveeNav = new MySQLConnector("exp_navee_navs", naveeNavSchema);

  return {
    Navee,
    NaveeNav,
  };
}

export function bind({
  Sites,
  Navee,
  NaveeNav,
}) {
  NaveeNav.model.hasOne(Navee.model, { foreignKey: "navigation_id" });
  Navee.model.belongsTo(NaveeNav.model, { foreignKey: "navigation_id" });

  NaveeNav.model.belongsTo(Sites.model, { foreignKey: "site_id", targetKey: "site_id" });
  Sites.model.hasOne(NaveeNav.model, { foreignKey: "site_id" });

  Navee.model.belongsTo(Sites.model, { foreignKey: "site_id", targetKey: "site_id" });
  Sites.model.hasOne(Navee.model, { foreignKey: "site_id" });
}

export default {
  connect,
  bind,
};
