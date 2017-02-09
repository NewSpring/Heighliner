/* tslint:disable:no-shadowed-variable */

import {
  INTEGER,
  STRING,
  BOOLEAN,
} from "sequelize";

import { MSSQLConnector } from "../../mssql";

const personSchema = {
  Id: { type: INTEGER, primaryKey: true },
  BirthDate: { type: INTEGER },
  BirthDay: { type: INTEGER },
  BirthMonth: { type: INTEGER },
  BirthYear: { type: INTEGER },
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

const aliasSchema = {
  Id: { type: INTEGER, primaryKey: true },
  PersonId: { type: INTEGER },
};

// XXX move to its own model if/when needed
const phoneNumberSchema = {
  Id: { type: INTEGER, primaryKey: true },
  CountryCode: { type: STRING },
  Description: { type: STRING },
  Extension: { type: STRING },
  IsMessagingEnabled: { type: STRING },
  IsSystem: { type: BOOLEAN },
  IsUnlisted: { type: BOOLEAN },
  Number: { type: STRING },
  NumberFormatted: { type: STRING },
  PersonId: { type: INTEGER },
};

let Person;
let PersonAlias;
let PhoneNumber;
export {
  Person,
  personSchema,

  PersonAlias,
  aliasSchema,

  PhoneNumber,
  phoneNumberSchema,
};

export function connect() {
  Person = new MSSQLConnector("Person", personSchema, {}, "People");
  PersonAlias = new MSSQLConnector("PersonAlias", aliasSchema);
  PhoneNumber = new MSSQLConnector("PhoneNumber", phoneNumberSchema);

  return {
    Person,
    PersonAlias,
    PhoneNumber,
  };
}

export function bind({
  Person,
  PersonAlias,
  PhoneNumber,
  Group,
}) {
  PersonAlias.model.belongsTo(Person.model, { foreignKey: "PersonId", targetKey: "Id" });
  Person.model.hasOne(PersonAlias.model, { foreignKey: "PersonId" });

  PhoneNumber.model.belongsTo(Person.model, { foreignKey: "PersonId", targetKey: "Id" });

  Person.model.belongsToMany(Group.model, {
    as: "Groups",
    through: "GroupMember",
    foreignKey: "PersonId",
    otherKey: "GroupId",
  });
}

export default {
  connect,
  bind,
};
