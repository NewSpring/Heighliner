import {
  INTEGER,
  STRING,
  CHAR,
} from "sequelize";

import { MySQLConnector } from "../mysql";

const channelSchema: Object = {
  channel_id: { type: INTEGER, primaryKey: true },
  channel_name: { type: STRING },
};

const channelTitleSchema: Object = {
  entry_id: { type: INTEGER, primaryKey: true },
  title: { type: String },
  status: { type: String },
  channel_id: { type: INTEGER },
};

const channelDataSchema: Object = {
  entry_id: { type: INTEGER, primaryKey: true },
  channel_id: { type: INTEGER },
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

export function connect() {
  Channels = new MySQLConnector("exp_channels", channelSchema);
  ChannelTitles =  new MySQLConnector("exp_channel_titles", channelTitleSchema);
  ChannelData = new MySQLConnector("exp_channel_data", channelDataSchema);

  Channels.model.hasMany(ChannelTitles.model, { foreignKey: "channel_id" });
  Channels.model.hasMany(ChannelData.model, { foreignKey: "channel_id" });

  ChannelTitles.model.belongsTo(Channels.model, { foreignKey: "channel_id" });
  ChannelTitles.model.hasMany(ChannelData.model, { foreignKey: "entry_id" });

  ChannelData.model.belongsTo(Channels.model, { foreignKey: "channel_id" });
  ChannelData.model.belongsTo(ChannelTitles.model, { foreignKey: "entry_id" });



}
