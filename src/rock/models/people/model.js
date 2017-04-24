import { reverse } from "lodash";
import { defaultCache } from "../../../util/cache";
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
  // GroupTypeRole,
  // GroupType,
} from "../groups/tables";

import {
  Campus,
  Location,
} from "../campuses/tables";

import { Rock } from "../system";

export class PhoneNumber extends Rock {
  __type = "PhoneNumber";
  cacheTypes = [
    "Rock.Model.PhoneNumber",
  ];

  constructor({ cache } = { cache: defaultCache }) {
    super({ cache });
    this.cache = cache;
  }

  setPhoneNumber = async ({ phoneNumber }, person) => {
    if (!phoneNumber) {
      return {
        code: 400,
        success: false,
        error: "Insufficient information",
      };
    }

    const nonFormattedPhoneNumber = phoneNumber.replace(/[-+() ]/g, "");

    // make sure user doesn't already have a phone number on file
    const hasPhoneNumber = await PhoneNumberTable.findOne({
      where: {
        PersonId: person.Id,
        Number: nonFormattedPhoneNumber,
      },
    });
    if (hasPhoneNumber) return { code: 204, success: true };

    const post = await PhoneNumberTable.post({
      IsMessagingEnabled: false,
      IsSystem: false,
      Number: nonFormattedPhoneNumber,
      NumberFormatted: phoneNumber,
      NumberTypeValueId: 12,
      PersonId: person.Id,
    });

    if (post && post.status >= 400) {
      return {
        code: post.status,
        error: post.statusText,
        success: false,
      };
    }

    this.cache.del(createGlobalId(`${person.Id}:PersonPhoneNumbers`));
    return { code: 200, success: true };
  }

}

export class Person extends Rock {
  __type = "Person";
  cacheTypes = [
    "Rock.Model.Person",
    "Rock.Model.PersonAlias",
  ];

  constructor({ cache } = { cache: defaultCache }) {
    super({ cache });
    this.cache = cache;
  }

  createGlobalAliasId(id) {
    return createGlobalId(`${id}`, "PersonAlias");
  }

  createGlobalGuidId(id) {
    return createGlobalId(`${id}`, "PersonGuid");
  }

  async clearCacheFromRequest({ body }) {
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

  async clearCacheFromId(id, globalId, action) {
    globalId = globalId ? globalId : createGlobalId(`${id}`, this.__type);
    // delete the cache entry
    return Promise.resolve()
      .then(x => this.cache.del(globalId))
      .then(x => {
        if (action && action === "delete") return;
        return this.getFromId(id, globalId);
      });
  }

  async clearCacheFromPersoAliasId(id, globalId, action) {
    globalId = globalId ? globalId : this.createGlobalAliasId(id);
    // delete the cache entry
    return Promise.resolve()
      .then(x => this.cache.del(globalId))
      .then(x => {
        if (action && action === "delete") return;
        return this.getFromAliasId(id);
      });
  }

  async getFromId(id, globalId) {
    globalId = globalId ? globalId : createGlobalId(`${id}`, this.__type);
    return this.cache.get(globalId, () => PersonTable.findOne({ where: { Id: id }}));
  }

  // async getGroupsFromId(...args) {
  //   return PersonTable.model.getGroups.apply(PersonTable.model, args);
  // }
  async getCampusFromId(id, { cache } = { cache: true }) {
    return await this.cache.get(`${id}:PersonCampus`, () => Group.findOne({
        where: { GroupTypeId: 10 }, // family
        include: [
          { model: GroupMember.model, where: { PersonId: `${id}` } },
          { model: Campus.model },
        ],
      })
        .then(x => x.Campus)
     , { cache });
  }

  async getPhoneNumbersFromId(id) {
    return await this.cache.get(createGlobalId(`${id}:PersonPhoneNumbers`), () => PhoneNumberTable.find({
        where: { PersonId: `${id}` },
      })
    );
  }

  async getHomesFromId(id, { cache } = { cache: true }) {
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
    , { cache });
  }

  async getFamilyFromId(id) {
    // XXX model this in sequelize
    return this.cache.get(`${id}:FamilyMembers`, () => GroupMember.db.query(`
        SELECT GroupMember.*
        FROM [GroupMember] gm
        LEFT JOIN [Group] g ON gm.[GroupId] = g.[Id]
        LEFT JOIN [GroupMember] GroupMember ON GroupMember.GroupId = g.Id
        WHERE gm.[PersonId] = ${id} AND g.[GroupTypeId] = 10
      `).then(([members]) => members)
    )
      .then(reverse)
      ;
  }

  // XXX correctly type
  async getFromAliasId(id, { cache } = { cache: true }) {
    id = Number(id);
    let globalId = this.createGlobalAliasId(id);

    return await this.cache.get(globalId, () => PersonAlias.findOne({
      where: { Id: id },
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
    , { cache });

  }

  async findOne({ guid }) {
    return this.cache.get(this.createGlobalGuidId(guid), () => PersonTable.findOne({
      where: { Guid: guid },
    }));
  }

  async getSecurityRoles(id) {
    return this.cache.get(`${id}:GroupMemberId`, () => Group.find({
        attributes: [ "Name", "Id" ],
        where: { GroupTypeId: 1 },
        include: [
          { model: GroupMember.model, where: { PersonId: `${id}` }, attributes: [] },
        ],
      })
    );
  }

}

export default {
  Person,
  PhoneNumber,
};
