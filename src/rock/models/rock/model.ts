
import { flatten, merge, isUndefined } from "lodash";
import { Cache, defaultCache } from "../../../util/cache";
import { createGlobalId } from "../../../util";

import {
  DefinedValue,
  DefinedType,
  FieldType,
} from "./tables";

export class Rock {
  public cache: Cache;
  public __type: string = "RockSystem";

  constructor({ cache } = { cache: defaultCache }) {
    this.cache = cache;
  }

  public async getFromId(id, globalId) {
    return Promise.reject(new Error("Not implemented on this model"));
  }

  public async getFromIds(data: any[]): Promise<any[]> {
    return Promise.all(data.map(x => this.getFromId(x.Id, createGlobalId(x.Id, this.__type))))
      .then(x => flatten(x as any[]))
  }

  public async getDefinedValueId(id: string | number): Promise<any> {
    const globalId = createGlobalId(`${id}`, "RockDefinedValues");
    return this.cache.get(globalId, () => DefinedValue.findOne({
        where: { Id: id },
        include: [
          { model: DefinedType.model, include: [{ model: FieldType.model }] },
        ],
      })
        // .then(this.processDefinedValues)
        // .then(this.debug);
    );
  }

  public debug(data: any): any {
    console.log("DEBUG:", data); // tslint:disable-line
    return data;
  }

}
