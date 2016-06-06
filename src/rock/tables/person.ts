import {
  INTEGER,
  STRING,
  CHAR,
} from "sequelize";

import { MSSQLConnector, Tables } from "../mssql";

const personSchema: Object = {
  Id: { type: INTEGER, primaryKey: true },
  FirstName: { type: STRING },
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
  }
};

export function bind({
  Person,
  PersonAlias,
}: Tables): void {
  
  PersonAlias.model.hasOne(Person.model, { foreignKey: "Id" });
  Person.model.belongsTo(PersonAlias.model, { foreignKey: "Id", targetKey: "PersonId" });
  
};

export default {
  connect,
  bind,
};