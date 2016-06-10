
import { flatten, merge, isUndefined } from "lodash";
import { Cache, defaultCache } from "../../../util/cache";
import { createGlobalId, Heighliner } from "../../../util";

import {
  DefinedValue,
  DefinedType,
  FieldType,
} from "./tables";

export class Rock extends Heighliner {
  public cache: Cache;
  public __type: string = "RockSystem";

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

}
