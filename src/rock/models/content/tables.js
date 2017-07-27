import { INTEGER, STRING } from "sequelize";

import { MSSQLConnector } from "../../mssql";

const contentChannelSchema = {
  Id: { type: INTEGER, primaryKey: true },
  Name: { type: STRING },
  ChannelUrl: { type: STRING },
  ContentChannelTypeId: { type: INTEGER },
  ContentControlType: { type: STRING },
  Description: { type: STRING },
  ItemsManuallyOrdered: { type: STRING },
  ItemUrl: { type: STRING },
};

const contentChannelItemSchema = {
  Id: { type: INTEGER, primaryKey: true },
  ApprovedByPersonAliasId: { type: STRING },
  ApprovedDateTime: { type: STRING },
  Content: { type: STRING },
  ContentChannelId: { type: INTEGER },
  ContentChannelTypeId: { type: INTEGER },
  ExpireDateTime: { type: STRING },
  Permalink: { type: STRING },
  Priority: { type: INTEGER },
  StartDateTime: { type: STRING },
  Status: { type: STRING },
  Title: { type: STRING },
};

let ContentChannel;
let ContentChannelItem;

export { ContentChannel, contentChannelSchema, ContentChannelItem, contentChannelItemSchema };

export function connect() {
  ContentChannel = new MSSQLConnector("ContentChannel", contentChannelSchema);
  ContentChannelItem = new MSSQLConnector("ContentChannelItem", contentChannelItemSchema);

  return {
    ContentChannel,
    ContentChannelItem,
  };
}

export function bind({ ContentChannel, ContentChannelItem, AttributeValue }) {
  ContentChannelItem.model.belongsTo(ContentChannel.model, {
    foreignKey: "ContentChannelId",
    targetKey: "Id",
  });

  ContentChannel.model.hasMany(ContentChannelItem.model, {
    foreignKey: "ContentChannelId",
    targetKey: "Id",
  });

  AttributeValue.model.belongsTo(ContentChannelItem.model, {
    foreignKey: "EntityId",
    targetKey: "ContentChannelId",
  });

  ContentChannelItem.model.hasMany(AttributeValue.model, {
    foreignKey: "EntityId",
    targetKey: "Id",
  });
}

export default {
  connect,
  bind,
};
