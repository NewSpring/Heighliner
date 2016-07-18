import { Cache, defaultCache } from "../../../util/cache";
import { createGlobalId } from "../../../util";

import {
  Person as PersonTable,
  PersonAlias,
  PhoneNumber as PhoneNumberTable,
} from "./tables";

import {
  Group,
  GroupMember,
  GroupLocation,
} from "../groups/tables";

import {
  Campus,
  Location,
} from "../campuses/tables";

import { Rock } from "../system";

export class Person extends Rock {
  public cache: Cache;
  public __type: string = "Person";
  public cacheTypes: string[] = [
    "Rock.Model.Person",
    "Rock.Model.PersonAlias",
  ];

  constructor({ cache } = { cache: defaultCache }) {
    super();
    this.cache = cache;
  }

  private createGlobalAliasId(id: string | number) {
    return createGlobalId(`${id}`, "PersonAlias");
  }

  private createGlobalGuidId(id: string | number) {
    return createGlobalId(`${id}`, "PersonGuid");
  }

  public async clearCacheFromRequest({ body }): Promise<any> {
    const { id, type, action } = body;
    return Promise.resolve()
      .then(x => {
        if (type === "Rock.Model.Person") {
          return this.clearCacheFromId(id, null, action);
        }
        if (type === "Rock.Model.PersonAlias") {
          return this.clearCacheFromPersoAliasId(id, null, action);
        }
      });
  }

  public async clearCacheFromId(id: string, globalId: string, action: string): Promise<any> {
    globalId = globalId ? globalId : createGlobalId(`${id}`, this.__type);
    // delete the cache entry
    return Promise.resolve()
      .then(x => this.cache.del(globalId))
      .then(x => {
        if (action && action === "delete") return;
        return this.getFromId(id, globalId);
      });
  }

  public async clearCacheFromPersoAliasId(
    id: string, globalId: string, action: string
  ): Promise<any> {
    globalId = globalId ? globalId : this.createGlobalAliasId(id);
    // delete the cache entry
    return Promise.resolve()
      .then(x => this.cache.del(globalId))
      .then(x => {
        if (action && action === "delete") return;
        return this.getFromAliasId(id);
      });
  }

  public async getFromId(id: string, globalId?: string): Promise<any> { // XXX correctly type
    globalId = globalId ? globalId : createGlobalId(`${id}`, this.__type);
    return this.cache.get(globalId, () => PersonTable.findOne({ where: { Id: id }}));
  }

  // public async getGroupsFromId(...args): Promise<any> {
  //   return PersonTable.model.getGroups.apply(PersonTable.model, args);
  // }
  public async getCampusFromId(id: string | number): Promise<any> {
    return await this.cache.get(`${id}:PersonCampus`, () => Group.findOne({
        where: { GroupTypeId: 10 }, // family
        include: [
          { model: GroupMember.model, where: { PersonId: `${id}` } },
          { model: Campus.model },
        ],
      })
        .then(x => x.Campus)
    );
  }

  public async getPhoneNumbersFromId(id: string | number): Promise<any> {
    return await this.cache.get(`${id}:PersonPhoneNumbers`, () => PhoneNumberTable.find({
        where: { PersonId: `${id}` },
      })
    );
  }

  public async getHomesFromId(id: string | number): Promise<any> {
    return await this.cache.get(`${id}:PersonHomes`, () => GroupLocation.find({
        where: { GroupLocationTypeValueId: 19 }, // Home
        attributes: [],
        include: [
          { model: Location.model },
          {
            model: Group.model,
            attributes: [],
            where: { GroupTypeId: 10 }, // Family
            include: [
              { model: GroupMember.model, where: { PersonId: `${id}` }, attributes: [] },
            ],
          },
        ],
      })
        .then(x => x.map(y => y.Location))
    );
  }

  public async getFamilyFromId(id: string | number): Promise<any> {
    // XXX model this in sequelize
    return GroupMember.db.query(`
      SELECT GroupMember.*
      FROM [GroupMember] gm
      LEFT JOIN [Group] g ON gm.[GroupId] = g.[Id]
      LEFT JOIN [GroupMember] GroupMember ON GroupMember.GroupId = g.Id
      WHERE gm.[PersonId] = ${id} AND g.[GroupTypeId] = 10
    `)
      .then(([members]) => members)
      .then(this.debug);
  }

  // XXX correctly type
  public async getFromAliasId(
    id: string | number,
    fields: string[] | string[][] = []
  ): Promise<any> {
    id = Number(id) as number;
    let globalId = this.createGlobalAliasId(id);

    return await this.cache.get(globalId, () => PersonAlias.findOne({
      where: { Id: id },
      attributes: fields,
      include: { model: PersonTable.model },
    })
      .then(x => x.Person)
      .then(data => {
        // XXX make this faster
        return PersonAlias.find({ where: { PersonId: data.Id } })
          .then(x => x.map(y => y.Id))
          .then(x => {
            data.aliases = x;
            return data;
          });
      })
    );

  }

  public async findOne({ guid }: { guid?: string }): Promise<any> {
    return this.cache.get(this.createGlobalGuidId(guid), () => PersonTable.findOne({
      where: { Guid: guid },
    }));
  }

}

export default {
  Person,
};
