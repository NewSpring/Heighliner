import { merge, filter, sortBy } from "lodash";
import { geography } from "mssql-geoparser";

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
  Campus as CampusTable,
} from "../campuses/tables";

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
    this.loader = new DataLoader(keys => {
      return GroupTable.find({
        where: { Id: { $in: sortBy(keys) }},
        order: ["Id"],
        include: [
          { model: GroupType.model, where: { Id: 25 }, attributes: [] },
          { model: AttributeValue.model, include: [{ model: Attribute.model }] },
        ],
      });
    }, { cache: false }); // XXX make this per request somehow
  }

  public async getFromId(id: string | number, globalId: string): Promise<any> { // XXX type
    globalId = globalId ? globalId : createGlobalId(`${id}`, this.__type);
    return this.cache.get(globalId, () => GroupTable.findOne({
      where: { Id: id },
      include: [
        { model: GroupType.model, where: { Id: 25 }, attributes: [] },
        { model: AttributeValue.model, include: [{ model: Attribute.model }] },
      ],
    }));
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
        .then(x => {
          if (!x.GeoPoint) return x;
          try {
            const { points } = geography(x.GeoPoint);
            x.latitude = points[0].x;
            x.longitude = points[0].y;
            return x;
          } catch (e) { return x; }
        })
    ); // XXX figure out how to cache geopoints
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
    { limit, offset, geo }: { limit: number, offset: number, geo: { latitude: number | boolean, longitude: number | boolean }}
  ): Promise<any> {
    if (!attributes || !attributes.length) return Promise.resolve([]);
    let order: any = [];
    const { latitude, longitude } = geo;
    let distance;
    if (latitude && longitude) {
      // XXX type check lat and lng for sql injection
      // tslint:disable-next-line
      order = Sequelize.literal(`[GroupLocations.Location].[GeoPoint].STDistance(geography::Point(${latitude}, ${longitude}, 4326)) ASC`);

      distance = [
        // tslint:disable-next-line
        Sequelize.literal(
          `[GroupLocations.Location].[GeoPoint].STDistance(geography::Point(${latitude}, ${longitude}, 4326))`
        ),
      "Distance",
      ];
    }

    const $or = attributes.map(x => ({
      Value: { $like: x },
    }));

    let count: number;
    const query = { attributes, latitude, longitude };

    return await this.cache.get(this.cache.encode(query), () => GroupTable.find({
      where: { IsPublic: true, IsActive: true },
      attributes: ["Id", distance],
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
    .then(this.getFromIdsWithDistance)
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

  private getFromIdsWithDistance = (x: any[]): Promise<any> => {
    let promises = [];
    const createPromise = (y) => {
      return this.getFromId(y.Id, null)
        .then(group => {
          group.Distance = y.Distance;
          return group;
        });
    };
    for (let y of x) promises.push(createPromise(y));

    return Promise.all(promises);
  }

  public async getDistanceFromLatLng(
    id: string | number,
    geo: { latitude: number | boolean, longitude: number | boolean }
  ): Promise<any> {
    if (!geo || !id || !geo.latitude || !geo.longitude) return Promise.resolve([]);
    const { latitude, longitude } = geo;
    const distance =  [
      // tslint:disable-next-line
      Sequelize.literal(
        `[GroupLocations.Location].[GeoPoint].STDistance(geography::Point(${latitude}, ${longitude}, 4326))`
      ),
    "Distance",
    ];

    return this.cache.get(this.cache.encode({ id, geo }), () => GroupTable.findOne({
        attributes: [ distance ],
        where: { Id: id },
        include: [
          {
            model: GroupLocationTable.model,
            include: [{ model: LocationTable.model }],
          },
        ],
      })
    )
      .then((x: any) => x.Distance)
      ;
  }

  public async findByQuery(
    { query },
    { limit, offset, geo }: {
      limit: number;
      offset: number;
      geo: { latitude: number | boolean, longitude: number | boolean };
    }
  ): Promise<any> {
    let order: any = [];
    const { latitude, longitude } = geo;
    let distance;
    if (latitude && longitude) {
      // tslint:disable-next-line
      order = Sequelize.literal(
        `[GroupLocations.Location].[GeoPoint].STDistance(geography::Point(${latitude}, ${longitude}, 4326)) ASC`
      );
      distance = [
        // tslint:disable-next-line
        Sequelize.literal(
          `[GroupLocations.Location].[GeoPoint].STDistance(geography::Point(${latitude}, ${longitude}, 4326))`
        ),
      "Distance",
      ];
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
          Sequelize.literal(`[Campus].[Name] LIKE N'%${
            query && query.toLowerCase().replace("campus", "").trim()
          }%'`),
        ],
      },
      attributes: ["Id", distance],
      order,
      include: [
        { model: GroupType.model, where: { Id: 25 }, attributes: [] },
        { model: CampusTable.model, attributes: ["Name"] },
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
    .then(this.getFromIdsWithDistance)
    .then(results => ({ count, results }))
    ;
}

public async findByAttributesAndQuery({ attributes, query }, { limit, offset, geo }): Promise<any> {
  let count = 0;

  // XXX prevent sql injection

  let point = `${Number(geo.latitude)}, ${Number(geo.longitude)}, 4326`;

  let q = { attributes, query, geo };
  // tslint:disable
  // WILEY METHOD
  return this.cache.get(this.cache.encode(q), () => GroupTable.db.query(`
    DECLARE @search AS NVARCHAR(100) = '${query ? query : ""}';
    DECLARE @metersPerMile AS DECIMAL = 1609.34;
    DECLARE @smallGroupTypeId AS INT = 25;
    DECLARE @groupEntityTypeId AS INT = (SELECT Id FROM EntityType WHERE Name = 'Rock.Model.Group');

    DECLARE @tagAttributeId AS INT = 16815;
    DECLARE @childcareAttributeId AS INT = 5406;
    DECLARE @typeAttributeId AS INT = 16814;
    DECLARE @categoryAttributeId AS INT = 1409;

    IF OBJECT_ID('tempdb.dbo.#groupTags', 'U') IS NOT NULL DROP TABLE #groupTags;

    SELECT g.Id AS GroupId, CONVERT(NVARCHAR(MAX), dv.Value) AS Tag, 1 as TagValue
    INTO #groupTags
    FROM [Group] g
    JOIN AttributeValue av ON av.EntityId = g.Id
    JOIN DefinedValue dv ON av.Value LIKE '%' + CONVERT(NVARCHAR(100), dv.[Guid]) + '%'
    WHERE av.AttributeId = @tagAttributeId AND g.GroupTypeId = @smallGroupTypeId;

    INSERT INTO #groupTags (GroupId, Tag, TagValue)
    SELECT g.Id, dv.Value, 1
    FROM [Group] g
    JOIN AttributeValue av ON av.EntityId = g.Id
    JOIN DefinedValue dv ON av.Value = CONVERT(NVARCHAR(100), dv.[Guid])
    WHERE
        av.AttributeId IN (@typeAttributeId, @categoryAttributeId)
        AND g.GroupTypeId = @smallGroupTypeId;

    INSERT INTO #groupTags (GroupId, Tag, TagValue)
    SELECT g.Id, 'Childcare', 1
    FROM [Group] g JOIN AttributeValue av ON av.EntityId = g.Id
    WHERE
        av.AttributeId = @childcareAttributeId
        AND av.Value = 'True'
        AND g.GroupTypeId = @smallGroupTypeId;

    IF LEN(@search) > 0
    BEGIN
        INSERT INTO #groupTags (GroupId, Tag, TagValue)
        SELECT g.Id, CONCAT(g.Name, ' ', g.[Description]), 2
        FROM [Group] g
        WHERE g.GroupTypeId = @smallGroupTypeId;

        INSERT INTO #groupTags (GroupId, Tag, TagValue)
        SELECT g.Id, c.Name, 2
        FROM [Group] g JOIN Campus c ON c.Id = g.CampusId
        WHERE g.GroupTypeId = @smallGroupTypeId;
    END

    SELECT
        gt.GroupId as Id,
        g.Name,
        l.[GeoPoint].STDistance(geography::Point(${point})) AS Distance,
        SUM(gt.TagValue) as RawValue,
        SUM(gt.TagValue) - ISNULL(CONVERT(INT, l.[GeoPoint].STDistance(geography::Point(${point})) / @metersPerMile / 10), 1000) AS Score
    FROM #groupTags gt
        JOIN [Group] g ON g.Id = gt.GroupId
        LEFT JOIN [GroupLocation] gl ON gl.GroupId = g.Id
        LEFT JOIN Location l ON gl.LocationId = l.Id
    WHERE
        (LEN(@search) > 0 AND gt.Tag LIKE '%' + @search + '%')
        ${attributes.length ? "OR gt.Tag IN (" + attributes.map(x => `'${x}'`).join(", ") + ")" : ""}
        AND g.GroupTypeId = @smallGroupTypeId
    GROUP BY
        gt.GroupId,
        g.Name,
        l.[GeoPoint].STDistance(geography::Point(${point}))
    ORDER BY
        SUM(gt.TagValue) - ISNULL(CONVERT(INT, l.[GeoPoint].STDistance(geography::Point(${point})) / @metersPerMile / 10), 1000) DESC,
        l.[GeoPoint].STDistance(geography::Point(${point})) ASC;
    `).then(([x]) => x)
  )
    // tslint:enable
    .then((x: any[]) => {
      count = x.length;
      return x;
    })
    .then((x: any[]) => {
      return x.slice(offset, limit + offset);
    })
    .then(this.getFromIdsWithDistance)
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
