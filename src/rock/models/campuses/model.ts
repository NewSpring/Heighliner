import { orderBy } from "lodash";
import { Cache, defaultCache } from "../../../util/cache";

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

  public async getFromId(id: string): Promise<any> { // XXX correctly type
    return Promise.resolve();
  }


}

export default {
  Campus,
};
