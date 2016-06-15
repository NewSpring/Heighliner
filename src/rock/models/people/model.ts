import { Cache, defaultCache } from "../../../util/cache";

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

  constructor({ cache } = { cache: defaultCache }) {
    super();
    this.cache = cache;
  }


  public async getFromId(id: string): Promise<any> { // XXX correctly type
    return Promise.resolve();
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

  // XXX correctly type
  public async getFromAliasId(
    id: string | number,
    fields: string[] | string[][] = []
  ): Promise<any> {
    id = Number(id) as number;

    return await this.cache.get(`PersonAlias:${id}`, () => PersonAlias.findOne({
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

}

export default {
  Person,
};
