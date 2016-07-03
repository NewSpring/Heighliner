import { merge, filter } from "lodash";
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
      })
    , { cache: false }); // XXX make this per request somehow
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
    , { cache: false }); // XXX figure out how to cache geopoints
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

  public async findByAttributes(
    attributes: string[],
    { limit, offset, geoPoint }: { limit: number, offset: number, geoPoint: { latitude: number | boolean, longitude: number | boolean }}
  ): Promise<any> {
    if (!attributes) return Promise.resolve([]);
    let order: any = [];
    const { latitude, longitude } = geoPoint;

    if (latitude && longitude) {
      // tslint:disable-next-line
      order = Sequelize.literal(`[GroupLocations.Location].[GeoPoint].STDistance(geography::Point(${latitude}, ${longitude}, 4326)) ASC`);
    }

    const $or = attributes.map(x => ({
      Value: { $like: x },
    }));

    let count: number;
    const query = { attributes, latitude, longitude };

    return await this.cache.get(this.cache.encode(query), () => GroupTable.find({
      where: { IsPublic: true, IsActive: true },
      attributes: ["Id"],
      order,
      include: [
        { model: GroupType.model, where: { Id: 25 }, attributes: [] },
        {
          model: GroupLocationTable.model,
          include: [{ model: LocationTable.model }],
        },
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
  )
    .then(this.sortByLocations)
    .then((x: any[]) => {
      count = x.length;
      return x;
    })
    .then((x: any[]) => {
      return x.slice(offset, limit + offset);
    })
    .then(this.getFromIds.bind(this))
    .then(results => ({ count, results }))
    ;
  }

  private sortByLocations(results: any[]): any[] {

    let withLocations = filter(results, (x) => {
      // XXX handle multiple locations
      return x.GroupLocations[0] &&
        x.GroupLocations[0].Location &&
        x.GroupLocations[0].Location.GeoPoint;
    });

    let withoutLocations = filter(results, (x) => {
      // XXX handle multiple locations
      return !x.GroupLocations[0] ||
        !x.GroupLocations[0].Location ||
        !x.GroupLocations[0].Location.GeoPoint;
    });

    return [...withLocations, ...withoutLocations];
  }

  public async findByQuery(
    { query },
    { limit, offset, geoPoint }: {
      limit: number;
      offset: number;
      geoPoint: { latitude: number | boolean, longitude: number | boolean };
    }
  ): Promise<any> {
    if (!query) return null;
    let order: any = [];
    const { latitude, longitude } = geoPoint;

    if (latitude && longitude) {
      // tslint:disable-next-line
      order = Sequelize.literal(
        `[GroupLocations.Location].[GeoPoint].STDistance(geography::Point(${latitude}, ${longitude}, 4326)) ASC`
      );
    }

    let count: number;
    const queryKey = { query, latitude, longitude };

    return await this.cache.get(this.cache.encode(queryKey), () => GroupTable.find({
      where: {
        IsPublic: true,
        IsActive: true,
        $or: [
          { Name: { $like: `%${query}%` } },
          { Description: { $like: `%${query}%` } },
          // XXX search locaton names?
          // { }
        ],
      },
      attributes: ["Id"],
      order,
      include: [
        { model: GroupType.model, where: { Id: 25 }, attributes: [] },
        {
          model: GroupLocationTable.model,
          include: [{ model: LocationTable.model }],
        },
      ],
    })
  )
    .then(this.sortByLocations)
    .then((x: any[]) => {
      count = x.length;
      return x;
    })
    .then((x: any[]) => {
      return x.slice(offset, limit + offset);
    })
    .then(this.getFromIds.bind(this))
    .then(results => ({ count, results }))
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
