/* tslint:disable:no-shadowed-variable */

import {
  INTEGER,
  STRING,
  BOOLEAN,
} from "sequelize";

import { MSSQLConnector, Tables } from "../../mssql";

const personSchema: Object = {
  Id: { type: INTEGER, primaryKey: true },
  BirthDate: { type: INTEGER },
  BirthDay: { type: INTEGER },
  BirthMonth: { type: INTEGER },
  ConnectionStatusValueId: { type: INTEGER },
  Email: { type: STRING },
  EmailPreference: { type: STRING },
  FirstName: { type: STRING },
  Gender: { type: INTEGER },
  GivingGroupId: { type: INTEGER },
  GivingId: { type: INTEGER },
  IsDeceased: { type: BOOLEAN },
  LastName: { type: STRING },
  MaritalStatusValueId: { type: INTEGER },
  MiddleName: { type: STRING },
  NickName: { type: STRING },
  PhotoId: { type: INTEGER },
};

const aliasSchema: Object = {
  Id: { type: INTEGER, primaryKey: true },
  PersonId: { type: INTEGER },
};

let Person;
let PersonAlias;
export {
  Person,
  personSchema,

  PersonAlias,
  aliasSchema,
};

export function connect(): Tables {
  Person = new MSSQLConnector("Person", personSchema);
  PersonAlias = new MSSQLConnector("PersonAlias", aliasSchema);

  return {
    Person,
    PersonAlias,
  };
};

export function bind({
  Person,
  PersonAlias,
}: Tables): void {

  PersonAlias.model.belongsTo(Person.model, { foreignKey: "PersonId", targetKey: "Id" });
  Person.model.hasOne(PersonAlias.model, { foreignKey: "Id" });

};

export default {
  connect,
  bind,
};
