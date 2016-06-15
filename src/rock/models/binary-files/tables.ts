/* tslint:disable:no-shadowed-variable */

import {
  INTEGER,
  STRING,
  BOOLEAN,
} from "sequelize";

import { MSSQLConnector, Tables } from "../../mssql";

const binaryFileSchema: Object = {
  Id: { type: INTEGER, primaryKey: true },
  BinaryFileTypeId: { type: INTEGER },
  Description: { type: STRING },
  FileName: { type: STRING },
  IsSystem: { type: BOOLEAN },
  IsTemporary: { type: BOOLEAN },
  MimeType: { type: STRING },
  Path: { type: STRING },
  StorageEntitySettings: { type: String },
  StorageEntityTypeId: { type: INTEGER },
};

const binaryFileTypeSchema: Object = {
  Id: { type: INTEGER, primaryKey: true },
  AllowCaching: { type: BOOLEAN },
  Description: { type: STRING },
  IsSystem: { type: BOOLEAN },
  Name: { type: STRING },
  StorageEntityTypeId: { type: INTEGER },
};


let BinaryFile;
let BinaryFileType;
export {
  BinaryFile,
  binaryFileSchema,

  BinaryFileType,
  binaryFileTypeSchema,
};

export function connect(): Tables {
  BinaryFile = new MSSQLConnector("BinaryFile", binaryFileSchema);
  BinaryFileType = new MSSQLConnector("BinaryFileType", binaryFileTypeSchema);

  return {
    BinaryFile,
    BinaryFileType,
  };
};

export function bind({
  BinaryFile,
}: Tables): void {

  BinaryFile.model.belongsTo(BinaryFileType.model, {
    foreignKey: "BinaryFileTypeId", targetKey: "Id",
  });

};

export default {
  connect,
  bind,
};
