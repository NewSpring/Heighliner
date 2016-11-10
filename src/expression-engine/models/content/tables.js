
import {
  INTEGER,
  STRING,
  CHAR,
} from "sequelize";

import { MySQLConnector } from "../../mysql";

const channelSchema = {
  channel_id: { type: INTEGER, primaryKey: true },
  channel_name: { type: STRING },
  field_group: { type: INTEGER },
};

const channelFieldSchema = {
  field_id: { type: INTEGER, primaryKey: true },
  group_id: { type: INTEGER },
  field_name: { type: STRING },
  field_label: { type: STRING },
};

const channelTitleSchema = {
  entry_id: { type: INTEGER, primaryKey: true },
  title: { type: STRING },
  status: { type: STRING },
  channel_id: { type: INTEGER },
  url_title: { type: STRING },
  year: { type: CHAR },
  day: { type: CHAR },
  month: { type: CHAR },
  entry_date: { type: INTEGER },
  expiration_date: { type: INTEGER },
};

const channelDataSchema = {
  entry_id: { type: INTEGER, primaryKey: true },
  channel_id: { type: INTEGER },
  site_id: { type: INTEGER },
};

const lowReorderSetSchema = {
  set_id: { type: INTEGER, primaryKey: true },
  set_name: { type: STRING },
};

const lowReorderOrderSchema = {
  set_id: { type: INTEGER, primaryKey: true },
  sort_order: { type: STRING },
};

let Channels;
let ChannelFields;
let ChannelTitles;
let ChannelData;
let LowReorder;
let LowReorderOrder;
export {
  Channels,
  channelSchema,

  ChannelFields,
  channelFieldSchema,

  ChannelTitles,
  channelTitleSchema,

  ChannelData,
  channelDataSchema,

  LowReorder,
  lowReorderSetSchema,

  LowReorderOrder,
  lowReorderOrderSchema,
};

export function connect() {
  Channels = new MySQLConnector("exp_channels", channelSchema);
  ChannelFields = new MySQLConnector("exp_channel_fields", channelFieldSchema);
  ChannelTitles =  new MySQLConnector("exp_channel_titles", channelTitleSchema);
  ChannelData = new MySQLConnector("exp_channel_data", channelDataSchema);
  LowReorder = new MySQLConnector("exp_low_reorder_sets", lowReorderSetSchema);
  LowReorderOrder = new MySQLConnector("exp_low_reorder_orders", lowReorderOrderSchema);

  return {
    Channels,
    ChannelFields,
    ChannelTitles,
    ChannelData,
    LowReorder,
    LowReorderOrder,
  };
};

export function bind({
  Channels,
  ChannelTitles,
  ChannelData,
  ChannelFields,
  LowReorder,
  LowReorderOrder,
}): void {
  Channels.model.hasMany(ChannelTitles.model, { foreignKey: "channel_id" });
  Channels.model.hasMany(ChannelData.model, { foreignKey: "channel_id" });

  Channels.model.belongsTo(ChannelFields.model, { foreignKey: "field_group", targetKey: "group_id" });
  ChannelFields.model.hasOne(Channels.model, { foreignKey: "field_group" });

  ChannelTitles.model.belongsTo(Channels.model, { foreignKey: "channel_id" });
  ChannelTitles.model.hasMany(ChannelData.model, { foreignKey: "entry_id" });

  ChannelData.model.belongsTo(Channels.model, { foreignKey: "channel_id" });
  ChannelData.model.belongsTo(ChannelTitles.model, { foreignKey: "entry_id" });

  LowReorderOrder.model.belongsTo(LowReorder.model, { foreignKey: "set_id", targetKey: "set_id" });
};

export default {
  connect,
  bind,
};
