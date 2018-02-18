import { merge } from "lodash";
import { defaultCache } from "../../../util/cache";
import { createGlobalId } from "../../../util";

import {
  Campus as CampusTable,
  Location as LocationTable, // XXX move to its own model
} from "./tables";

import { Rock } from "../system";

export class Campus extends Rock {
  __type = "Campus";

  constructor({ cache } = { cache: defaultCache }) {
    super();
    this.cache = cache;
  }

  async getFromId(id, globalId) {
    globalId = globalId ? globalId : createGlobalId(`${id}`, this.__type);
    return this.cache.get(globalId, () =>
      CampusTable.findOne({ where: { Id: id } })
    );
  }

  async findByLocationId(id, globalId) {
    globalId = globalId ? globalId : createGlobalId(`${id}`, "Location");
    return this.cache.get(globalId, () =>
      LocationTable.findOne({ where: { Id: id } })
    );
  }

  // async findByPersonId(id) {
  //   return
  // }

  async find(query) {
    query = merge({ IsActive: true }, query);
    for (const key in query) {
      if (!query[key]) delete query[key];
    }
    return this.cache
      .get(this.cache.encode(query), () =>
        CampusTable.find({
          where: query,
          attributes: ["Id"],
        })
      )
      .then(this.getFromIds.bind(this))
      .then(x => x.filter(y => y.Name !== "Central"));
  }
}

export default {
  Campus,
};
