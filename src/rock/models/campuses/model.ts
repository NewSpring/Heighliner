import { merge } from "lodash";
import { Cache, defaultCache } from "../../../util/cache";
import { createGlobalId } from "../../../util";

import {
  Campus as CampusTable,
  Location as LocationTable, // XXX move to its own model
} from "./tables";

import { Rock } from "../rock";

export class Campus extends Rock {
  public cache: Cache
  public __type: string = "Campus";

  constructor({ cache } = { cache: defaultCache }) {
    super();
    this.cache = cache;
  }

  public async getFromId(id: string | number, globalId: string): Promise<any> { // XXX type
    globalId = globalId ? globalId : createGlobalId(`${id}`, this.__type);
    return this.cache.get(globalId, () => CampusTable.find({ where: { Id: id }}));
  }

  public async findByLocationId(id: string | number, globalId: string): Promise<any> {
    globalId = globalId ? globalId : createGlobalId(`${id}`, "Location");
    return this.cache.get(globalId, () => LocationTable.findOne({ where: { Id: id }}));
  }

  public async find(query): Promise<any> {
    query = merge({ IsActive: true }, query);
    return this.cache.get(this.cache.encode(query), () => CampusTable.find({
      where: query,
      attributes: ["Id"],
    })
      .then(this.getFromIds.bind(this))
    );

  }


}

export default {
  Campus,
};
