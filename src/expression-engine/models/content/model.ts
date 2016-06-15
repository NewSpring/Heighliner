import { pick, flatten } from "lodash";
import { Cache, defaultCache } from "../../../util/cache";

import {
  Channels,
  channelSchema,
  ChannelFields,
  // channelFieldSchema,
  ChannelTitles,
  channelTitleSchema,
  ChannelData,
  channelDataSchema,

  LowReorder,
  LowReorderOrder,
} from "./tables";

import {
  Matrix,
  MatrixCol,
} from "../ee/matrix";

import { EE } from "../ee";

export interface ChannelField {
  field_id: number;
  group_id: number;
  field_name: string;
  field_label: string;
}
export class Content extends EE {
  public __type: string =  "Content";
  public cache: Cache;

  constructor({ cache } = { cache: defaultCache }) {
    super();
    this.cache = cache;
  }

  public pickField(name: string, fields: any): string {
    let fieldName = name;
    fields.forEach(x => {
      if (x.field_name !== name) return;

      fieldName = `field_id_${x.field_id}`;
    });

    return fieldName;
  }

  private createFieldNames(fields: ChannelField[], remove): string[][] {
    return fields.map(field => {
      let name = field.field_name;

      if (remove) {
        let splitName = name.split("_");
        splitName.shift();
        name = splitName.join("_");
      } else {
        name = `${name}@dynamic`;
      }

      return [`field_id_${field.field_id}`, name];
    });
  }

  public async getFromId(id: string, guid: string): Promise<any> { // replace with ContentType
    const fields = await this.cache.get(`fields:${id}`, () => ChannelData.find({
      where: { entry_id: Number(id) },
      include: [ { model: Channels.model,  include: [ { model: ChannelFields.model } ] } ],
    })
      .then(x => flatten(x.map(y => y.exp_channel.exp_channel_field)))
      .then(x => this.createFieldNames(x, true))
    ) as string[][];

    const exp_channel_fields = this.createFieldObject(fields);
    return await this.cache.get(guid, () => ChannelData.findOne({
      where: { entry_id: Number(id) },
      attributes:  ["entry_id", "channel_id", "site_id"].concat(fields as any[]), // why typescript
      include: [
        { model: Channels.model},
        { model: ChannelTitles.model },
      ],
    })
      .then(x => {
        x.exp_channel.exp_channel_fields = exp_channel_fields;
        return x;
      })
    );
  }

  private createFieldObject(fields: string[][]): any {
    let fieldObject = {};
    fields.forEach(x => {
      const [fieldId, fieldName] = x;
      fieldObject[fieldName] = fieldId;
    });
    return fieldObject;
  }

  public async getContentFromMatrix(
    entry_id: string, name: string, field_id: number
  ): Promise<any> {
    if (!entry_id || !field_id) return [];

    const columns = await this.cache.get(`matrix:${field_id}`, () => MatrixCol.find({
        where: { field_id },
        attributes: ["col_id", "col_name", "col_label"],
      })) as any;

    let columnIds = columns.map(x => [`col_id_${x.col_id}`, x.col_name]);

    const query = { entry_id, name, field_id };
    return await this.cache.get(this.cache.encode(query), () => ChannelData.find({
      where: { entry_id },
      attributes: ["entry_id"],
      include: [
        { model: Matrix.model, where: { field_id }, attributes: columnIds },
      ],
    })
      .then(x => flatten(x.map(y => y.exp_matrix_data))));
  };

  public async getFromLowReorderSet(setName): Promise<any> {
    // XXX cache breaking on this set
    return await this.cache.get(`${setName}:LowReorderSetName`, () => LowReorderOrder.findOne({
      attributes: ["sort_order"],
      include: [{ model: LowReorder.model, where: { set_name: setName } }],
    })
      .then(x => x.sort_order.split("|"))
      .then(x => x.filter(x => !!x).map(y => ({ entry_id: y }))) // used so the next line can work
      .then(this.getFromIds.bind(this))
    , { ttl: 3600 }); // expire this lookup every hour
  }

  public async find(query: any = {}, cache): Promise<any> {
    const { limit, offset } = query; // true options

    // channel data fields
    const channelData = pick(query,  Object.keys(channelDataSchema));
    const channel = pick(query, Object.keys(channelSchema));
    // const channelFields = pick(query, Object.keys(channelFieldSchema));
    const channelTitle = pick(query, Object.keys(channelTitleSchema));
    return await this.cache.get(this.cache.encode(query), () => ChannelData.find({
      where: channelData,
      attributes: ["entry_id"],
      order: [
        [ChannelTitles.model, "entry_date", "DESC"],
      ],
      include: [
        { model: Channels.model, where: channel },
        { model: ChannelTitles.model, where: channelTitle },
      ],
      limit,
      offset,
    })
      .then(this.getFromIds.bind(this))
    , { ttl: 3600, cache });
  }

}

export default {
  Content,
};
