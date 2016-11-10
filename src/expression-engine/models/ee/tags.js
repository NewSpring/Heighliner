/* tslint:disable:no-shadowed-variable */

import {
  INTEGER,
  STRING,
} from "sequelize";

import { MySQLConnector, Tables } from "../../mysql";

const tagSchema: Object = {
  tag_id: { type: INTEGER, primaryKey: true },
  tag_name: { type: STRING },
  entry_date: { type: INTEGER },
  clicks: { type: INTEGER },
};

const tagEntriesSchema: Object = {
  tag_id: { type: INTEGER, primaryKey: true },
  entry_id: { type: INTEGER },
};


let Tags;
let TagEntries;
export {
  Tags,
  tagSchema,

  TagEntries,
  tagEntriesSchema
};

export function connect(): Tables {
  Tags = new MySQLConnector("exp_tag_tags", tagSchema);
  TagEntries = new MySQLConnector("exp_tag_entries", tagEntriesSchema);

  return {
    Tags,
    TagEntries,
  };
};

export function bind({
  ChannelData,
  Tags,
  TagEntries,
}: Tables): void {

  ChannelData.model.hasMany(TagEntries.model, { foreignKey: "entry_id" });
  TagEntries.model.belongsTo(ChannelData.model, { foreignKey: "entry_id" });

  Tags.model.hasMany(TagEntries.model, { foreignKey: "tag_id" });
  TagEntries.model.belongsTo(Tags.model, { foreignKey: "tag_id" });

};

export default {
  connect,
  bind,
};
