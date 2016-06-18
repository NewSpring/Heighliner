import { merge } from "lodash";
import { Cache, defaultCache } from "../../../util/cache";
import { createGlobalId } from "../../../util";
import Sequelize from "sequelize";
import DataLoader from "dataloader";

import {
  Group as GroupTable,
  GroupMember as GroupMemberTable,
  GroupLocation as GroupLocationTable,
  GroupType,
  GroupTypeRole,
  Schedule as ScheduleTable,
} from "./tables";

import {
  DefinedValue,
  Attribute,
  AttributeValue,
  EntityType,
} from "../system/tables";

import {
  Location as LocationTable, // XXX move to its own model
} from "../campuses/tables";

import { Rock } from "../system";

export class Group extends Rock {
  private loader;
  public cache: Cache;
  public __type: string = "Group";

  constructor({ cache } = { cache: defaultCache }) {
    super();
    this.cache = cache;

    // NOTE:
    // we use expand and fetch group attributes on this call
    // because they are needed in most fields
    // within the Group Schema
    this.loader = new DataLoader(keys => GroupTable.find({
      where: { Id: { $in: keys }},
      include: [
        { model: GroupType.model, where: { Id: 25 }, attributes: [] },
        { model: AttributeValue.model, include: [{ model: Attribute.model }] },
      ],
    }));
  }

  public async getFromId(id: string | number, globalId: string): Promise<any> { // XXX type
    globalId = globalId ? globalId : createGlobalId(`${id}`, this.__type);
    return this.cache.get(globalId, () => this.loader.load(id));
  }

  public async getMembersById(id: string | number): Promise<any> {
    return this.cache.get(`${id}:GroupMemberFromGroupId}`, () => GroupMemberTable.find({
        where: { GroupId: id },
        include: [{ model: GroupTypeRole.model }],
      })
    );
  }

  // XXX remove for Location Model
  public async getLocationFromLocationId(Id: string | number): Promise<any> {
    const globalId = createGlobalId(`${Id}`, "Location");
    return this.cache.get(globalId, () => LocationTable.findOne({
        where: { Id },
      })
    );
  }

  // XXX remove for Schedule Model
  public async getScheduleFromScheduleId(Id: string | number): Promise<any> {
    const globalId = createGlobalId(`${Id}`, "Schedule");
    return this.cache.get(globalId, () => ScheduleTable.findOne({
        where: { Id },
      })
    );
  }

  public async getLocationsById(id: string | number): Promise<any> {
    const globalId = createGlobalId(`${id}`, "GroupLocationsFromGroupId");
    return this.cache.get(globalId, () => GroupLocationTable.find({
        where: { GroupId: id },
      })
    );
  }

  public async findByAttributes(attributes: string[]): Promise<any> {
    if (!attributes) return Promise.resolve([]);

    const $or = attributes.map(x => ({
      Value: { $like: x },
    }));

    const query = { attributes };
    return await this.cache.get(this.cache.encode(query), () => GroupTable.find({
      where: { IsPublic: true, IsActive: true },
      attributes: ["Id"],
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
    // return await this.cache.get(this.cache.encode(query), () => new Promise((r, rj) =>{
    //   Sequelize.query(`
    //     SELECT TOP :limit
    //       g.Id, gt.Name, a.Name, av.Value, dv.Value
    //     FROM
    //         [Group] g
    //         JOIN AttributeValue av ON av.EntityId = g.Id
    //         JOIN Attribute a ON a.Id = av.AttributeId
    //         JOIN EntityType et ON a.EntityTypeId = et.Id
    //         LEFT JOIN DefinedValue dv ON av.Value LIKE CONCAT('%', dv.[Guid], '%')
    //         JOIN GroupType gt ON gt.Id = g.GroupTypeId
    //     WHERE
    //         dv.Value = 'Motorsports'
    //         AND et.Id = 16
    //         AND gt.Id = 25
    //   `)
    // })
      .then(this.getFromIds.bind(this))
    );
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
