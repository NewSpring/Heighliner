import {
  INTEGER,
  STRING,
  CHAR,
} from "sequelize";

import { MySQLConnector, Tables } from "../mysql";

const channelSchema: Object = {
  channel_id: { type: INTEGER, primaryKey: true },
  channel_name: { type: STRING },
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
};

const channelDataSchema: Object = {
  entry_id: { type: INTEGER, primaryKey: true },
  channel_id: { type: INTEGER },
  site_id: { type: INTEGER },
  actual_date: { type: STRING, field: "field_id_6" },

  // editorial
  editorial_body: { type: STRING, field: "field_id_18" },
  editorial_authors: { type: STRING, field: "field_id_657" },
  editorial_tags: { type: STRING, field: "field_id_1028" },
  editorial_ooyalaId: { type: STRING, field: "field_id_668" },
};

let Channels;
let ChannelTitles;
let ChannelData;
export {
  Channels,
  channelSchema,

  ChannelTitles,
  channelTitleSchema,

  ChannelData,
  channelDataSchema,
};

export function connect(): Tables {
  Channels = new MySQLConnector("exp_channels", channelSchema);
  ChannelTitles =  new MySQLConnector("exp_channel_titles", channelTitleSchema);
  ChannelData = new MySQLConnector("exp_channel_data", channelDataSchema);
  
  return {
    Channels,
    ChannelTitles,
    ChannelData
  }
};

export function bind({ Channels, ChannelTitles, ChannelData }: Tables): void {
  Channels.model.hasMany(ChannelTitles.model, { foreignKey: "channel_id" });
  Channels.model.hasMany(ChannelData.model, { foreignKey: "channel_id" });

  ChannelTitles.model.belongsTo(Channels.model, { foreignKey: "channel_id" });
  ChannelTitles.model.hasMany(ChannelData.model, { foreignKey: "entry_id" });

  ChannelData.model.belongsTo(Channels.model, { foreignKey: "channel_id" });
  ChannelData.model.belongsTo(ChannelTitles.model, { foreignKey: "entry_id" });
};

export default {
  connect,
  bind,
};