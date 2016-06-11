import { orderBy } from "lodash";
import { Cache, defaultCache } from "../../../util/cache";

import {
  Person as PersonTable,
  PersonAlias,
} from "./tables";

import { Rock } from "../system";

export class Person extends Rock {
  public cache: Cache
  public __type: string = "Person";

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
          })
      })
    );

  }

}

export default {
  Person,
};
