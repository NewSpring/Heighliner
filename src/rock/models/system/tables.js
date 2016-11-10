/* tslint:disable:no-shadowed-variable */

import {
  INTEGER,
  STRING,
  BOOLEAN,
  UUID,
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
  CategoryId: { type: INTEGER },
};

const definedValueSchema: Object = {
  Id: { type: INTEGER, primaryKey: true },
  Guid: { type: UUID },
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
  Class: { type: STRING },
};

const attributeSchema: Object = {
  Id: { type: INTEGER, primaryKey: true },
  DefaultValue: { type: STRING },
  Description: { type: STRING },
  EntityTypeId: { type: INTEGER },
  EntityTypeQualifierColumn: { type: STRING },
  EntityTypeQualifierValue: { type: STRING },
  FieldTypeId: { type: INTEGER },
  Key: { type: STRING },
  Name: { type: STRING },
};

const attributeValueSchema: Object = {
  Id: { type: INTEGER, primaryKey: true },
  AttributeId: { type: INTEGER },
  EntityId: { type: INTEGER },
  Value: { type: STRING },
};

const attributeQualifierSchema: Object = {
  Id: { type: INTEGER, primaryKey: true },
  AttributeId: { type: INTEGER },
  Value: { type: STRING },
  Key: { type: STRING },
};

const entityTypeSchema: Object = {
  Id: { type: INTEGER, primaryKey: true },
  AssemblyName: { type: STRING },
  FriendlyName: { type: STRING },
  IsEntity: { type: BOOLEAN },
  IsSecured: { type: BOOLEAN },
  MultiValueFieldTypeId: { type: INTEGER },
  Name: { type: STRING },
};

let DefinedType;
let DefinedValue;
let FieldType;
let Attribute;
let AttributeQualifier;
let AttributeValue;
let EntityType;
export {
  DefinedType,
  definedTypeSchema,

  DefinedValue,
  definedValueSchema,

  FieldType,
  fieldTypeSchema,

  Attribute,
  attributeSchema,

  AttributeQualifier,
  attributeQualifierSchema,

  AttributeValue,
  attributeValueSchema,

  EntityType,
  entityTypeSchema,

};

export function connect(): Tables {
  DefinedType = new MSSQLConnector("DefinedType", definedTypeSchema);
  DefinedValue = new MSSQLConnector("DefinedValue", definedValueSchema);
  FieldType = new MSSQLConnector("FieldType", fieldTypeSchema);
  Attribute = new MSSQLConnector("Attribute", attributeSchema);
  AttributeQualifier = new MSSQLConnector(
    "AttributeQualifier", attributeQualifierSchema
  );
  AttributeValue = new MSSQLConnector("AttributeValue", attributeValueSchema);
  EntityType = new MSSQLConnector("EntityType", entityTypeSchema);

  return {
    DefinedType,
    DefinedValue,
    FieldType,
    Attribute,
    AttributeValue,
    AttributeQualifier,
    EntityType,
  };
};

export function bind({
  DefinedType,
  DefinedValue,
  FieldType,
  Attribute,
  AttributeQualifier,
  AttributeValue,
  EntityType,
}: Tables): void {

  DefinedType.model.belongsTo(FieldType.model, { foreignKey: "FieldTypeId", targetKey: "Id" });
  FieldType.model.hasMany(DefinedType.model, { foreignKey: "Id" });

  DefinedValue.model.belongsTo(DefinedType.model, { foreignKey: "DefinedTypeId", targetKey: "Id" });
  DefinedType.model.hasMany(DefinedValue.model, { foreignKey: "Id" });

  AttributeValue.model.belongsTo(Attribute.model, { foreignKey: "AttributeId", targetKey: "Id" });
  Attribute.model.hasMany(AttributeValue.model, { foreignKey: "Id" });

  AttributeQualifier.model.belongsTo(Attribute.model, { foreignKey: "AttributeId", targetKey: "Id" });
  Attribute.model.hasMany(AttributeQualifier.model, { foreignKey: "AttributeId" });

  Attribute.model.belongsTo(EntityType.model, { foreignKey: "EntityTypeId", targetKey: "Id" });
  Attribute.model.belongsTo(FieldType.model, { foreignKey: "FieldTypeId", targetKey: "Id" });

  // DefinedValue.model.belongsTo(AttributeValue.model, { foreignKey: "Value", targetKey: "Guid"});
  // AttributeValue.model.hasMany(DefinedValue.model, { foreignKey: "Guid"  });

  AttributeValue.model.belongsTo(DefinedValue.model, { foreignKey: "Value", targetKey: "Guid" });
  DefinedValue.model.hasMany(AttributeValue.model, { foreignKey: "Guid" });

};

export default {
  connect,
  bind,
};
