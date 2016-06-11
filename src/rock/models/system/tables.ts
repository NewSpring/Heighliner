import {
  INTEGER,
  STRING,
  CHAR,
  BOOLEAN,
} from "sequelize";

import { MSSQLConnector, Tables } from "../../mssql";

const definedTypeSchema: Object = {
  Id: { type: INTEGER, primaryKey: true },
  IsSystem: { type: BOOLEAN },
  FieldTypeId: { type: INTEGER },
  Order: { type: INTEGER },
  Name: { type: INTEGER },
  Description: { type: INTEGER },
  HelpText: { type: STRING },
  CategoryId: { type: INTEGER }
};

const definedValueSchema: Object = {
  Id: { type: INTEGER, primaryKey: true },
  IsSystem: { type: BOOLEAN },
  DefinedTypeId: { type: INTEGER },
  Order: { type: INTEGER },
  Value: { type: STRING },
  Description: { type: INTEGER },
};

const fieldTypeSchema: Object = {
  Id: { type: INTEGER, primaryKey: true },
  IsSystem: { type: BOOLEAN },
  Name: { type: INTEGER },
  Description: { type: STRING },
  Assembly: { type: STRING },
  Class: { type: STRING }
};

let DefinedType;
let DefinedValue;
let FieldType;
export {
  DefinedType,
  definedTypeSchema,

  DefinedValue,
  definedValueSchema,

  FieldType,
  fieldTypeSchema,
};

export function connect(): Tables {
  DefinedType = new MSSQLConnector("DefinedType", definedTypeSchema);
  DefinedValue = new MSSQLConnector("DefinedValue", definedValueSchema);
  FieldType = new MSSQLConnector("FieldType", fieldTypeSchema);

  return {
    DefinedType,
    DefinedValue,
    FieldType,
  }
};

export function bind({
  DefinedType,
  DefinedValue,
  FieldType,
}: Tables): void {

  DefinedType.model.belongsTo(FieldType.model, { foreignKey: "FieldTypeId", targetKey: "Id" });
  FieldType.model.hasMany(DefinedType.model, { foreignKey: "Id" });

  DefinedValue.model.belongsTo(DefinedType.model, { foreignKey: "DefinedTypeId", targetKey: "Id" });
  DefinedType.model.hasMany(DefinedValue.model, { foreignKey: "Id" });

};

export default {
  connect,
  bind,
};