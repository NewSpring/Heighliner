import { merge } from "lodash";
import { Cache, defaultCache } from "../../../util/cache";
import { createGlobalId } from "../../../util";

import {
  Group as GroupTable,
  // Location as LocationTable, // XXX move to its own model
} from "./tables";

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
