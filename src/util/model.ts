
import { flatten } from "lodash";
import { Cache, defaultCache } from "./cache";
import { createGlobalId } from "./node/model";

export class Heighliner {
  public cache: Cache;
  public __type: string; // tslint:disable-line
  public id: string;
  public cacheTypes: string[];

  constructor({ cache } = { cache: defaultCache }) {
    this.cache = cache;
  }

  public async getFromId(id, globalId) {
    return Promise.reject(new Error("Not implemented on this model"));
  }

  public async clearCacheFromRequest(
    { body }: { body: any }
  ): Promise<any> {
    return Promise.reject(new Error(`Caching not implement on ${body.type}`));
  }

  public async getFromIds(data: any[]): Promise<any[]> {
    return Promise.all(data.map(x => this.getFromId(x[this.id], createGlobalId(x[this.id], this.__type))))
      .then(x => flatten(x as any[]));
  }

  public debug(data: any): any {
    console.log("DEBUG:", data); // tslint:disable-line
    return data;
  }

}
