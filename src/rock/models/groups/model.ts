import { merge } from "lodash";
import { Cache, defaultCache } from "../../../util/cache";
import { createGlobalId } from "../../../util";
import Sequelize from "sequelize";

import {
  Group as GroupTable,
  GroupType,
  // Location as LocationTable, // XXX move to its own model
} from "./tables";

import {
  DefinedValue,
  Attribute,
  AttributeValue,
  EntityType,
} from "../system/tables";

import { Rock } from "../system";

export class Group extends Rock {
  public cache: Cache;
  public __type: string = "Group";

  constructor({ cache } = { cache: defaultCache }) {
    super();
    this.cache = cache;
  }

  public async getFromId(id: string | number, globalId: string): Promise<any> { // XXX type
    globalId = globalId ? globalId : createGlobalId(`${id}`, this.__type);
    return this.cache.get(globalId, () => GroupTable.find({ where: { Id: id }}));
  }

  public async findByAttributes(attributes: string[]): Promise<any> {
    const $or = attributes.map(x => ({
      Value: { $like: x },
    }));
    return await GroupTable.find({
      // limit: 10,
      where: { IsPublic: true, IsActive: true },
      // attributes: ["Name"],
      include: [
        { model: GroupType.model, where: { Id: 25 }, attributes: [] },
        {
          model: AttributeValue.model,
          attributes: ["Value"],
          include: [
            {
              model: Attribute.model,
              attributes: ["Name"],
              include: [{ model: EntityType.model, where: { Id: 16 }}], // Rock.Model.Group
            },
            {
              model: DefinedValue.model,
              on: {
                "$AttributeValues.Value$": {
                  $like: Sequelize.fn("CONCAT", "%", Sequelize.col(
                    "[AttributeValues.DefinedValue].[Guid]"
                  ), "%"),
                },
              },
              attributes: ["Value"],
              where: { $or }, // the actual lookup
            },
          ],
        },
      ],
    })
    ;
  }

  // public async getFromPerson
  public async find(query): Promise<any> {
    query = merge({ IsActive: true }, query);
    return this.cache.get(this.cache.encode(query), () => GroupTable.find({
      where: query,
      attributes: ["Id"],
    })
      .then(this.getFromIds.bind(this))
    );

  }
}

export default {
  Group,
};
