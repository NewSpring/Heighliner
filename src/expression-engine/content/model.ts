import { merge, pick } from "lodash";

import { Cache, defaultCache } from "../../util/cache";

import {
  Channels,
  channelSchema,
  ChannelData,
  channelDataSchema,
  ChannelTitles,
  channelTitleSchema,
} from "../tables/channels";

import { EE } from "../ee";

export class Content extends EE {
  private cache: Cache

  constructor({ cache } = { cache: defaultCache }) {
    super();
    this.cache = cache;
  }

  public async getFromId(id: string): Promise<any> { // replace with ContentType
    return await ChannelData.findOne({
      where: { entry_id: Number(id) },
      include: [
        { model: Channels.model },
        { model: ChannelTitles.model },
      ]
    });
  }

  public async find(query: any = {}) {
    const { limit, offset } = query; // true options
    delete query.limit;
    delete query.offset;

    // channel data fields
    const channelDataFields = pick(query,  Object.keys(channelDataSchema));
    const channelFields = pick(query, Object.keys(channelSchema));
    const channelTitleFields = pick(query, Object.keys(channelTitleSchema));

    return await ChannelData.find({
      where: channelDataFields,
      include: [
        { model: Channels.model, where: channelFields },
        { model: ChannelTitles.model, where: channelTitleFields },
      ],
      limit,
      offset
    });
  }
}

export default {
  Content,
};
