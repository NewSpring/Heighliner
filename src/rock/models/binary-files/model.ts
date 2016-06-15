// import { merge } from "lodash";
import { Cache, defaultCache } from "../../../util/cache";
import { createGlobalId } from "../../../util";

import {
  BinaryFile as BinaryFileTable,
  // Location as LocationTable, // XXX move to its own model
} from "./tables";

import { Rock } from "../system";

export class BinaryFile extends Rock {
  public cache: Cache;
  public __type: string = "BinaryFile";

  constructor({ cache } = { cache: defaultCache }) {
    super();
    this.cache = cache;
  }

  public async getFromId(id: string | number, globalId: string): Promise<any> { // XXX type
    globalId = globalId ? globalId : createGlobalId(`${id}`, this.__type);
    return this.cache.get(globalId, () => BinaryFileTable.findOne({ where: { Id: id }})
      .then(x => {
        // is relative path to Rock
        if (x.Path[0] === "~") {
          x.Path = x.Path.substr(2);
          x.Path = this.baseUrl + x.Path;
        }

        // remove query string variables
        if (x.Path && x.Path.indexOf("?") > -1) {
          x.Path = x.Path.substr(0, x.Path.indexOf("?"));
        }

        return x;
      })
    );
  }

  // public async getFromPerson
  public async find(query): Promise<any> {
    return this.cache.get(this.cache.encode(query), () => BinaryFileTable.find({
      where: query,
      attributes: ["Id"],
    })
      .then(this.getFromIds.bind(this))
    );

  }


}

export default {
  BinaryFile,
};
