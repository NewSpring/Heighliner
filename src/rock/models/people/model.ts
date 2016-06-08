import { orderBy } from "lodash";
import { Cache, defaultCache } from "../../../util/cache";

import {
  Person,
  PersonAlias,
} from "./tables";

import { Rock } from "../../rock";

export class People extends Rock {
  private cache: Cache

  constructor({ cache } = { cache: defaultCache }) {
    super();
    this.cache = cache;
  }


  public async getFromId(id: string): Promise<any> { // XXX correctly type
    return Promise.resolve();
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
      include: { model: Person.model },
    })
      .then(x => x.Person)
    );

  }

}

export default {
  People,
};
