import { flatten, isNil } from "lodash";
import { defaultCache } from "./cache";
import { createGlobalId } from "./node/model";

export class Heighliner {
  constructor({ cache } = { cache: defaultCache }) {
    this.cache = cache;
  }

  async getFromId(id, globalId) {
    return Promise.reject(new Error("Not implemented on this model"));
  }

  async clearCacheFromRequest({ body }) {
    return Promise.reject(new Error(`Caching not implement on ${body.type}`));
  }

  async getFromIds(data = []) {
    if (!data || !data.length) return Promise.resolve([]);
    return Promise
      .all(
        data.map(x =>
          this.getFromId(x[this.id], createGlobalId(x[this.id], this.__type))),
      )
      .then(x => flatten(x))
      .then(x => x.filter(y => !isNil(y)).map(z => {
        const item = z;
        item.__type = this.__type;
        return item;
      }));
  }

  debug(data) {
    console.log("DEBUG:", data); // tslint:disable-line
    return data;
  }
}
