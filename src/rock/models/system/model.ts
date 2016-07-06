
import { pick, sortBy, flatten } from "lodash";
import { Cache } from "../../../util/cache";
import { createGlobalId, Heighliner } from "../../../util";

import {
  DefinedValue as DefinedValueModel,
  DefinedType as DefinedTypeModel,
  FieldType as FieldTypeModel,
  Attribute as AttributeModel,
  AttributeValue as AttributeValueModel,
  AttributeQualifier as AttributeQualifierModel,
  // EntityType as EntityTypeModel,
} from "./tables";

import FieldTypeResolvers from "./fieldTypeResolvers";

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
  IsSystem?: boolean;
  DefinedTypeId?: number;
  Order?: number;
  Value: string;
  Description: string;
}

export interface DefinedValueSearch extends DefinedValue {
  DefinedType: DefinedType;
}

export interface Attribute {
  Id: number;
  DefaultValue: string;
  Description?: string;
  EntityTypeId?: number;
  FieldTypeId: number;
  Key?: string;
  Name?: string;
}

export interface AttributeSearch extends Attribute {
  FieldType: FieldType;
}

export interface AttributeValue {
  Id: number;
  AttributeId?: number;
  EntityId?: number;
  Value: string;
  Guid?: string;
}

export interface AttributeValueSearch extends AttributeValue {
  Attribute: AttributeSearch;
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
  public baseUrl: string = "https://rock.newspring.cc"; // XXX make dynamic


  private processDefinedValues(values: DefinedValueSearch[]): Promise<DefinedValue[]> {
    const promises = values.map(x => {
      if (FieldTypeResolvers.hasOwnProperty(x.DefinedType.FieldType.Class)) {
        return Promise.resolve()
          .then(() => {
            x.Value = FieldTypeResolvers[x.DefinedType.FieldType.Class](x.Value, null, this.cache);
            return pick(x, definedValueKeys) as DefinedValue;
          }) as Promise<DefinedValue>;
      }

      console.error(`No field type resolver found for ${x.DefinedType.FieldType.Class}`);
      // XXX how should we alert on missing defined value types?
      return Promise.resolve()
        .then(() => pick(x, definedValueKeys)) as Promise<DefinedValue>;
    });

    return Promise.all([].concat(promises))
      .then(x => sortBy(x, "Order"));
  }

  private processAttributeValue(value: AttributeValueSearch): Promise<any> {
    if (!value) return;

    const { FieldType, DefaultValue } = value.Attribute;
    if (FieldTypeResolvers.hasOwnProperty(FieldType.Class)) {
      return Promise.resolve()
      .then(() => {
        const method = FieldTypeResolvers[FieldType.Class] as () => any;
        return method.apply(this, [value.Value, DefaultValue]);
      });
    }

    console.error(`No field type resolver found for ${FieldType.Class}`);
    return Promise.resolve(null);
  }

  public async getDefinedValuesByTypeId(
    id: string | number,
    { limit, offset }: { limit?: number, offset?: number } = {}
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

  public async getDefinedValueByGuid(Guid: string | number): Promise<any> {
    const Guids = `${Guid}`.split(",");
    const globalId = createGlobalId(`${Guid}`, "RockDefinedValueGuid");
    return this.cache.get(globalId, () => DefinedValueModel.find({
        where: { Guid: { $in: Guids } },
        include: [
          { model: DefinedTypeModel.model, include: [{ model: FieldTypeModel.model }] },
        ],
      })
        .then(this.processDefinedValues)
    );
  }

  public async getAttributeValuesFromId(id, context): Promise<any> {

    return this.cache.get(`${id}:getAttributeValuesFromId`, () => AttributeValueModel.findOne({
      where: { Id: id },
      include: [{ model: AttributeModel.model, include: [{ model: FieldTypeModel.model }] }],
    })
      .then(this.processAttributeValue.bind(context))
    );
  }

  public async getAttributesFromId(id, context): Promise<any> {

    return this.cache.get(`${id}:getAttributeValues`, () => AttributeModel.findOne({
      where: { Id: id },
      include: [
        { model: FieldTypeModel.model },
        { model: AttributeQualifierModel.model },
      ],
    })
      .then((x: any): any => {
        if (!x) return null;
        const { FieldType } = x;
        // 70
        if (FieldType.Class !== "Rock.Field.Types.DefinedValueFieldType") {
          return [{
            Id: x.Id,
            Value: x.Name,
            Description: x.Description,
          }] as any;
        }
        const definedTypeId = x.AttributeQualifiers
          .filter(y => y.Key === "definedtype");

        return this.getDefinedValuesByTypeId(definedTypeId[0].Value);
      })
      .then(flatten)
    );
  }

}

export default {
  Rock,
};
