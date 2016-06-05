import { merge, pick, flatten } from "lodash";

import { Cache, defaultCache } from "../../util/cache";

import {
  Channels,
  channelSchema,
  ChannelFields,
  channelFieldSchema,
  ChannelTitles,
  channelTitleSchema,
  ChannelData,
  channelDataSchema,
  
} from "../tables/channels";

import {
  Matrix,
  MatrixCol,
} from "../tables/matrix";

import { EE } from "../ee";

export interface ChannelField {
  field_id: number;
  group_id: number;
  field_name: string;
  field_label: string;
}
export class Content extends EE {
  private cache: Cache

  constructor({ cache } = { cache: defaultCache }) {
    super();
    this.cache = cache;
  }
  
  public pickField(name: string, fields: any): string {
    let fieldName = name;
    fields.forEach(x => {
      if (x.field_name != name) return;
      
      fieldName = `field_id_${x.field_id}`;
    });
    
    return fieldName;
  }
  
  private createFieldNames(fields: ChannelField[], channelType: string): string[][] {
    return fields.map(field => {
      let name = field.field_name.split("_");
      name.shift();
      // xxx this will probably need to be more borust
      const newName = name.join("_");     
      return [`field_id_${field.field_id}`, newName];
    });
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
  
  private createFieldObject(fields: string[][]): any {
    let fieldObject = {};
    fields.forEach(x => {
      const [fieldId, fieldName] = x;
      fieldObject[fieldName] = fieldId;
    })
    return fieldObject;
  }

  public async getContentFromMatrix(entry_id: string, name: string, field_id: number): Promise<any> {
    if (!entry_id || !field_id) return [];
    
    const columns = await MatrixCol.find({
        where: { field_id },
        attributes: ["col_id", "col_name", "col_label"],
      });
    
    let columnIds = columns.map(x => [`col_id_${x.col_id}`, x.col_name]);

    return await ChannelData.find({
      where: { entry_id },
      attributes: ["entry_id"],
      include: [
        { model: Matrix.model, where: { field_id }, attributes: columnIds },
      ],
    })
      .then(x => flatten(x.map(y => y.exp_matrix_data)));
  };
  
  public async find(query: any = {}) {
    const { limit, offset } = query; // true options
    delete query.limit;
    delete query.offset;

    // channel data fields
    const channelData = pick(query,  Object.keys(channelDataSchema));
    const channel = pick(query, Object.keys(channelSchema));
    const channelFields = pick(query, Object.keys(channelFieldSchema));
    const channelTitle = pick(query, Object.keys(channelTitleSchema));
    
    const fields = await Channels.find({
      where: channel,
      include: [
        { model: ChannelFields.model }
      ]
    })
      .then(x => x.map(y => y.exp_channel_field))
      .then(this.createFieldNames);
    
    const exp_channel_fields = this.createFieldObject(fields);
          
    return await ChannelData.find({
      where: channelData,
      attributes: ["entry_id", "channel_id", "site_id"].concat(fields),
      order: [
        [ChannelTitles.model, "entry_date", "DESC"]
      ],
      include: [
        {
          model: Channels.model,
          where: channel,
        },
        { model: ChannelTitles.model, where: channelTitle },
      ],
      limit,
      offset
    })
      .then(x => x.map(y => {
        y.exp_channel.exp_channel_fields = exp_channel_fields
        return y;
      }));
 
  }
}

export default {
  Content,
};
