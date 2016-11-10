/* tslint:disable:no-shadowed-variable */

import {
  INTEGER,
} from "sequelize";

import { MySQLConnector, Tables } from "../../mysql";

const matrixSchema: Object = {
  row_id: { type: INTEGER, primaryKey: true },
  site_id: { type: INTEGER },
  entry_id: { type: INTEGER },
  field_id: { type: INTEGER },
};

const matrixColSchema: Object = {
  col_id: { type: INTEGER, primaryKey: true },
  site_id: { type: INTEGER },
  field_id: { type: INTEGER },
};

let Matrix;
let MatrixCol;
export {
  Matrix,
  matrixSchema,

  MatrixCol,
  matrixColSchema,
};

export function connect(): Tables {
  Matrix = new MySQLConnector("exp_matrix_data", matrixSchema);
  MatrixCol = new MySQLConnector("exp_matrix_cols", matrixColSchema);

  return {
    Matrix,
    MatrixCol,
  };
};

export function bind({
  ChannelData,
  Matrix,
  MatrixCol,
  AssetsSelections,
}: Tables): void {

  // Matrix.model.belongsTo(ChannelData.model, { foreignKey: "entry_id" });
  // Matrix.model.belongsTo(AssetsSelections.model, { foreignKey: "row_id" });

  // MatrixCol.model.belongsTo(AssetsSelections.model, { foreignKey: "col_id" });


  // // get access to matrix from channel data
  ChannelData.model.hasMany(Matrix.model, { foreignKey: "entry_id" });
  Matrix.model.belongsTo(ChannelData.model, { foreignKey: "entry_id" });

  // make it possible to get files out of matrix
  Matrix.model.hasMany(AssetsSelections.model, { foreignKey: "row_id" });
  MatrixCol.model.hasOne(AssetsSelections.model, { foreignKey: "col_id" });

  AssetsSelections.model.belongsTo(Matrix.model, { foreignKey: "row_id" });
  AssetsSelections.model.belongsTo(MatrixCol.model, { foreignKey: "col_id" });

};

export default {
  connect,
  bind,
};
