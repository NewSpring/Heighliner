/* tslint:disable:no-shadowed-variable */

import {
  INTEGER,
  STRING,
  CHAR,
} from "sequelize";

import { MySQLConnector, Tables } from "../../mysql";

const channelSchema: Object = {
  channel_id: { type: INTEGER, primaryKey: true },
  channel_name: { type: STRING },
  field_group: { type: INTEGER },
};

const channelFieldSchema: Object = {
  field_id: { type: INTEGER, primaryKey: true },
  group_id: { type: INTEGER },
  field_name: { type: STRING },
  field_label: { type: STRING },
};

const channelTitleSchema: Object = {
  entry_id: { type: INTEGER, primaryKey: true },
  title: { type: STRING },
  status: { type: STRING },
  channel_id: { type: INTEGER },
  url_title: { type: STRING },
  year: { type: CHAR },
  day: { type: CHAR },
  month: { type: CHAR },
  entry_date: { type: INTEGER },
};

const channelDataSchema: Object = {
  entry_id: { type: INTEGER, primaryKey: true },
  channel_id: { type: INTEGER },
  site_id: { type: INTEGER },
};

let Channels;
let ChannelFields;
let ChannelTitles;
let ChannelData;
export {
  Channels,
  channelSchema,

  ChannelFields,
  channelFieldSchema,

  ChannelTitles,
  channelTitleSchema,

  ChannelData,
  channelDataSchema,
};

export function connect(): Tables {
  Channels = new MySQLConnector("exp_channels", channelSchema);
  ChannelFields = new MySQLConnector("exp_channel_fields", channelFieldSchema);
  ChannelTitles =  new MySQLConnector("exp_channel_titles", channelTitleSchema);
  ChannelData = new MySQLConnector("exp_channel_data", channelDataSchema);

  return {
    Channels,
    ChannelFields,
    ChannelTitles,
    ChannelData,
  };
};

export function bind({
  Channels,
  ChannelTitles,
  ChannelData,
  ChannelFields,
}: Tables): void {
  Channels.model.hasMany(ChannelTitles.model, { foreignKey: "channel_id" });
  Channels.model.hasMany(ChannelData.model, { foreignKey: "channel_id" });

  Channels.model.belongsTo(ChannelFields.model, { foreignKey: "field_group", targetKey: "group_id" });
  ChannelFields.model.hasOne(Channels.model, { foreignKey: "field_group" });

  ChannelTitles.model.belongsTo(Channels.model, { foreignKey: "channel_id" });
  ChannelTitles.model.hasMany(ChannelData.model, { foreignKey: "entry_id" });

  ChannelData.model.belongsTo(Channels.model, { foreignKey: "channel_id" });
  ChannelData.model.belongsTo(ChannelTitles.model, { foreignKey: "entry_id" });
};

export default {
  connect,
  bind,
};
