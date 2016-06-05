import {
  INTEGER,
  STRING,
  CHAR,
} from "sequelize";

import { MySQLConnector, Tables } from "../mysql";

const matrixSchema: Object = {
  row_id: { type: INTEGER, primaryKey: true },
  site_id: { type: INTEGER },
  entry_id: { type: INTEGER },
  field_id: { type: INTEGER },
  
  // start the long list of cols...
  // XXX can this be more dynamic?
  // collection_images: { type: STRING, field: "col_id_269" },
  // collection_download_description: { type: STRING, field: "col_id_223" },
  // collection_download_file: { type: STRING, field: "col_id_224" },
  // collection_download_title: { type: STRING, field: "col_id_225" },

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
  }
};

export function bind({
  ChannelData,
  Matrix,
  MatrixCol,
  AssetsSelections,
}: Tables): void {

  try {
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

 
  
  } catch (e) {
    console.log(e);
  }
 
  
  
};

export default {
  connect,
  bind,
};