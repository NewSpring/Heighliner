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
  try {
    PersonAlias.model.hasOne(Person.model, { foreignKey: "Id" });
    Person.model.belongsTo(PersonAlias.model, { foreignKey: "Id", targetKey: "PersonId" });
    
    console.time("rock-search");
    PersonAlias.find({
      include: [
        { model: Person.model, required: true }
      ],
      limit: 1,
    }).then((data) => {
      const now = new Date()
      console.timeEnd("rock-search");
      console.log(`Just used SQL to look up a person named ${data[0].Person.FirstName}`);
    })
  } catch (e) {
    console.log(e);
  }
 
  
};

export default {
  connect,
  bind,
};