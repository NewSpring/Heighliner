/* tslint:disable:no-shadowed-variable */

import { INTEGER, STRING } from "sequelize";

import { MySQLConnector } from "../../mysql";

const assetsFilesSchema = {
  file_id: { type: INTEGER, primaryKey: true },
  folder_id: { type: INTEGER },
  source_type: { type: STRING },
  source_id: { type: INTEGER },
  file_name: { type: STRING },
};

const assetsSelectionSchema = {
  file_id: { type: INTEGER },
  entry_id: { type: INTEGER },
  field_id: { type: INTEGER },
  col_id: { type: INTEGER },
  row_id: { type: INTEGER },
  var_id: { type: INTEGER },
};

const assetsFoldersSchema = {
  folder_id: { type: INTEGER, primaryKey: true },
  source_id: { type: INTEGER },
  parent_id: { type: INTEGER },
  full_path: { type: STRING },
};

const assetsSourcesSchema = {
  source_id: { type: INTEGER, primaryKey: true },
  settings: { type: STRING },
};

let Assets;
let AssetsSelections;
let AssetsFolders;
let AssetsSources;
export {
  Assets,
  assetsFilesSchema,
  AssetsSelections,
  assetsSelectionSchema,
  AssetsFolders,
  assetsFoldersSchema,
  AssetsSources,
  assetsSourcesSchema,
};

export function connect() {
  Assets = new MySQLConnector("exp_assets_files", assetsFilesSchema);
  AssetsSelections = new MySQLConnector(
    "exp_assets_selections",
    assetsSelectionSchema,
  );
  AssetsFolders = new MySQLConnector("exp_assets_folders", assetsFoldersSchema);
  AssetsSources = new MySQLConnector("exp_assets_sources", assetsSourcesSchema);

  // no primary key
  AssetsSelections.model.removeAttribute("id");

  return {
    Assets,
    AssetsSelections,
    AssetsFolders,
    AssetsSources,
  };
}

export function bind(
  {
    ChannelData,
    Assets,
    AssetsSelections,
    AssetsFolders,
    AssetsSources,
  },
) {
  Assets.model.hasMany(AssetsSelections.model, { foreignKey: "file_id" });
  AssetsSelections.model.belongsTo(Assets.model, { foreignKey: "file_id" });

  Assets.model.belongsTo(AssetsSources.model, { foreignKey: "source_id" });
  AssetsSources.model.hasOne(Assets.model, { foreignKey: "source_id" });

  Assets.model.belongsTo(AssetsFolders.model, { foreignKey: "folder_id" });
  AssetsFolders.model.hasOne(Assets.model, { foreignKey: "folder_id" });

  // get access to assets from channel data
  ChannelData.model.hasOne(AssetsSelections.model, { foreignKey: "entry_id" });
}

export default {
  connect,
  bind,
};
