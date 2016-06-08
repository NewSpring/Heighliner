import {
  INTEGER,
  STRING,
  CHAR,
  BOOLEAN,
} from "sequelize";

import { MSSQLConnector, Tables } from "../../mssql";

const personSchema: Object = {
  Id: { type: INTEGER, primaryKey: true },
};

const aliasSchema: Object = {
  Id: { type: INTEGER, primaryKey: true },
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
  }
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
};;