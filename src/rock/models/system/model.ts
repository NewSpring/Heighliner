
import { pick, sortBy } from "lodash";
import { Cache } from "../../../util/cache";
import { createGlobalId, Heighliner } from "../../../util";

import {
  DefinedValue as DefinedValueModel,
  DefinedType as DefinedTypeModel,
  FieldType as FieldTypeModel,
} from "./tables";

import DefinedValueResolvers from "./definedTypeResolvers";

export interface FieldType {
  Id: number;
  IsSystem: boolean;
  Name: string;
  Description: string;
  Assembly: string;
  Class: string;
}

export interface DefinedType {
  Id: number;
  IsSystem: boolean;
  FieldTypeId: number;
  Order: number;
  Name: string;
  Description: string;
  HelpText: string;
  CategoryId: number;
  FieldType: FieldType;
}

export interface DefinedValue {
  Id: number;
  IsSystem: boolean;
  DefinedTypeId: number;
  Order: number;
  Value: string;
  Description: string;
}

export interface DefinedValueSearch extends DefinedValue {
  DefinedType: DefinedType;
}

export const definedValueKeys = [
  "Id",
  "IsSystem",
  "DefinedTypeId",
  "Order",
  "Value",
  "Description",
];

export class Rock extends Heighliner {
  public cache: Cache;
  public __type: string = "RockSystem";
  public id: string = "Id";

  private processDefinedValues(values: DefinedValueSearch[]): Promise<DefinedValue[]> {
    const promises = values.map(x => {
      if (DefinedValueResolvers.hasOwnProperty(x.DefinedType.FieldType.Class)) {
        return Promise.resolve()
          .then(() => DefinedValueResolvers[x.DefinedType.FieldType.Class](x)) as Promise<DefinedValue>;
      }
      // XXX how should we alert on missing defined value types?
      return Promise.resolve()
        .then(() => pick(x, definedValueKeys)) as Promise<DefinedValue>;
    });

    return Promise.all([].concat(promises))
      .then(x => sortBy(x, "Order"));
  }

  public async getDefinedValuesByTypeId(
    id: string | number,
    { limit, offset }: { limit: number, offset: number }
  ): Promise<any> {
    const query = { limit, offset, id };
    return this.cache.get(this.cache.encode(query), () => DefinedValueModel.find({
        include: [
          {
            model: DefinedTypeModel.model,
            include: [{ model: FieldTypeModel.model }],
            where: { Id: id },
          },
        ],
        order: [["Order", "ASC"]],
        limit,
        offset,
      })
        .then(this.debug)
        .then(this.processDefinedValues)
    );
  }

  public async getDefinedValueId(id: string | number): Promise<any> {
    const globalId = createGlobalId(`${id}`, "RockDefinedValue");
    return this.cache.get(globalId, () => DefinedValueModel.findOne({
        where: { Id: id },
        include: [
          { model: DefinedTypeModel.model, include: [{ model: FieldTypeModel.model }] },
        ],
      })
        .then(x => this.processDefinedValues([x]))
        .then(x => x[0])
    );
  }

}

export default {
  Rock,
};
