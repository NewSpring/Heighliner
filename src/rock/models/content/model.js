import { merge, isNil, pick, flatten, find, uniq, sampleSize } from "lodash";
import { defaultCache } from "../../../util/cache";
import { createGlobalId } from "../../../util";

import { ContentChannel, ContentChannelItem } from "./tables";
import { AttributeValue, Attribute } from "../system/tables";

import { Rock } from "../system";

export class RockContent extends Rock {
  __type = "RockContent";

  constructor({ cache } = { cache: defaultCache }) {
    super();
    this.cache = cache;
  }

  async getAttributeFromId(key, id, globalId) {
    globalId = globalId ? globalId : createGlobalId(`Content:${id}:${key}`, this.__type);
    return this.cache
      .get(globalId, () =>
        AttributeValue.find({
          attributes: ["Value"],
          include: [
            {
              model: Attribute.model,
              attributes: ["Name"],
              where: {
                EntityTypeQualifierColumn: { $or: ["ContentChannelTypeId", "ContentChannelId"] },
                EntityTypeQualifierValue: { $or: [3, 5] },
                Key: key,
              },
            },
          ],
          where: {
            EntityId: id,
          },
        }),
      )
      .then(x => x.map(y => y.Value));
  }

  /**
      SELECT av.[Value],a.[Name]
      FROM AttributeValue av
      INNER JOIN Attribute a
      ON av.AttributeId = a.Id
      WHERE
      AND (
      (
          a.EntityTypeQualifierColumn  = 'ContentChannelTypeId' AND
          a.EntityTypeQualifierValue = 3
      )
      OR
      (
          a.EntityTypeQualifierColumn = 'ContentChannelId' AND
          a.EntityTypeQualifierValue = 5
      )
      )

    --AND
    --a.[Key] = 'Image' AND
    --av.EntityId = 1586
    **/

  async find(query) {
    const { limit, offset, channel } = query; // true options

    return await this.cache
      .get(this.cache.encode(query, this.__type), () =>
        ContentChannelItem.find({
          order: [["StartDateTime", "desc"]],
          include: [{ model: ContentChannel.model, where: { Name: `${channel}` } }],
        }),
      )
      .then(x => x.slice(offset, limit + offset))
      .then(flatten)
      .then(x =>
        x.filter(y => !isNil(y)).map((z) => {
          const item = z;
          item.__type = this.__type;
          return item;
        }),
      )
      .then(this.debug);
  }
}
export default {
  RockContent,
};
