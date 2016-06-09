import {
  INTEGER,
  STRING,
  CHAR,
  BOOLEAN,
} from "sequelize";

import { MSSQLConnector, Tables } from "../../mssql";

const campusSchema: Object = {
  Id: { type: INTEGER, primaryKey: true },
};

const locationSchema: Object = {
  Id: { type: INTEGER, primaryKey: true },
};

let Campus;
let Location;
export {
  Campus,
  campusSchema,

  Location,
  locationSchema,
};

export function connect(): Tables {
  Campus = new MSSQLConnector("Campus", campusSchema);
  Location = new MSSQLConnector("Location", locationSchema);

  return {
    Campus,
    Location,
  }
};

export function bind({
  Campus,
  Location,
}: Tables): void {

  // Campus.model.belongsTo(Location.model, { foreignKey: "LocationId", targetKey: "Id" });
  // Location.model.hasOne(Campus.model, { foreignKey: "Id" });

};

export default {
  connect,
  bind,
};