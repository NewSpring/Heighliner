/* tslint:disable:no-shadowed-variable */

import { INTEGER, STRING, BOOLEAN, GEOGRAPHY } from "sequelize";

import { MSSQLConnector } from "../../mssql";

const campusSchema = {
  Id: { type: INTEGER, primaryKey: true },
  Name: { type: STRING },
  Guid: { type: STRING },
  ShortCode: { type: STRING },
  Url: { type: STRING },
  LocationID: { type: INTEGER },
  PhoneNumber: { type: STRING },
  Description: { type: STRING },
  ServiceTimes: { type: STRING },
  IsActive: { type: BOOLEAN }
};

const locationSchema = {
  Id: { type: INTEGER, primaryKey: true },
  Name: { type: STRING },
  IsActive: { type: BOOLEAN },
  LocationTypeValueId: { type: INTEGER },
  GeoPoint: { type: GEOGRAPHY },
  GeoFence: { type: GEOGRAPHY },
  Street1: { type: STRING },
  Street2: { type: STRING },
  City: { type: STRING },
  State: { type: STRING },
  Country: { type: STRING },
  PostalCode: { type: STRING }
};

let Campus;
let Location;
export { Campus, campusSchema, Location, locationSchema };

export function connect() {
  Campus = new MSSQLConnector("Campus", campusSchema);
  Location = new MSSQLConnector("Location", locationSchema);

  return {
    Campus,
    Location
  };
}

export function bind({ Campus, Location }) {
  Campus.model.belongsTo(Location.model, {
    foreignKey: "LocationId",
    targetKey: "Id"
  });
}

export default {
  connect,
  bind
};
