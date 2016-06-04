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

let Channels;
let ChannelTitles;
export {
  Channels,
  ChannelTitles,
};

export function connect() {
  Channels = new MySQLConnector("exp_channels", channelSchema);
  ChannelTitles =  new MySQLConnector("exp_channel_titles", channelTitleSchema);

  Channels.model.hasMany(ChannelTitles.model, { foreignKey: "channel_id" });
  ChannelTitles.model.belongsTo(Channels.model, { foreignKey: "channel_id" });
}
