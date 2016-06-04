
import { createGlobalId } from "../../util";

export default {

  Content: {
    id: ({ entry_id }: any, _, $, { parentType }) => createGlobalId(entry_id, parentType.name),
    channel: ({ channel_id }: any) => createGlobalId(channel_id, "Channel"),
    channelName: ({ exp_channel }) => exp_channel.channel_name,
  },

};
