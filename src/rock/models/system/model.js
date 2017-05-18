import sequelize from "sequelize"
import { pick, sortBy, flatten } from "lodash";
import { createGlobalId, Heighliner } from "../../../util";

import uuid from "node-uuid";

import {
  DefinedValue as DefinedValueModel,
  DefinedType as DefinedTypeModel,
  FieldType as FieldTypeModel,
  Attribute as AttributeModel,
  AttributeValue as AttributeValueModel,
  AttributeQualifier as AttributeQualifierModel,
  Communication as CommunicationTable,
  CommunicationRecipient as CommunicationRecipientTable,
  SystemEmail as SystemEmailTable,
  // EntityType as EntityTypeModel,
} from "./tables";

import FieldTypeResolvers from "./fieldTypeResolvers";

export const definedValueKeys = [
  "Id",
  "IsSystem",
  "DefinedTypeId",
  "Order",
  "Value",
  "Description",
];

export class Rock extends Heighliner {
  __type = "RockSystem";
  id = "Id";
  baseUrl = process.env.ROCK_URL;


  processDefinedValues(values) {
    const promises = values.map(x => {
      if (FieldTypeResolvers.hasOwnProperty(x.DefinedType.FieldType.Class)) {
        return Promise.resolve()
          .then(() => {
            x.Value = FieldTypeResolvers[x.DefinedType.FieldType.Class](x.Value, null, this.cache);
            return pick(x, definedValueKeys);
          });
      }

      console.error(`No field type resolver found for ${x.DefinedType.FieldType.Class}`);
      // XXX how should we alert on missing defined value types?
      return Promise.resolve()
        .then(() => pick(x, definedValueKeys));
    });

    return Promise.all([].concat(promises))
      .then(x => sortBy(x, "Order"));
  }

  processAttributeValue(value) {
    if (!value) return;

    const { FieldType, DefaultValue } = value.Attribute;
    if (FieldTypeResolvers.hasOwnProperty(FieldType.Class)) {
      return Promise.resolve()
      .then(() => {
        const method = FieldTypeResolvers[FieldType.Class];
        return method.apply(this, [value.Value, DefaultValue]);
      });
    }

    console.error(`No field type resolver found for ${FieldType.Class}`);
    return Promise.resolve(null);
  }

  async getDefinedValuesByTypeId(id, { limit, offset } = {}) {
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
        .then(this.processDefinedValues)
    );
  }

  async getDefinedValueId(id) {
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

  async getDefinedValueByGuid(Guid) {
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

  async getAttributeFromId(id) {
    return this.cache.get(`${id}:getAttributeFromId`, () => AttributeModel.findOne({
      where: { Id: id },
    }))
  }

  async getAttributeValuesFromAttributeId(id, context, EntityId) {
    const where = { AttributeId: id };
    if (EntityId) where.EntityId = EntityId;
    console.log(where)
    return this.cache.get(`${id}:${EntityId}:getAttributeValuesFromAttributeId`, () => AttributeValueModel.find({
      where,
      include: [{ model: AttributeModel.model, include: [{ model: FieldTypeModel.model }] }],
    })
      .then(x => Promise.all(x.map(async (y) => {
        const value = await this.processAttributeValue.call(context, y);
        return {
          ...y,
          Value: value,
        };
      })))
    );
  }

  async getAttributeValuesFromId(id, context) {

    return this.cache.get(`${id}:getAttributeValuesFromId`, () => AttributeValueModel.findOne({
      where: { Id: id },
      include: [{ model: AttributeModel.model, include: [{ model: FieldTypeModel.model }] }],
    })
      .then(this.processAttributeValue.bind(context))
    );
  }

  async sendEmail(title, people = [], data = {}) {
    if (!title) throw new Error("No email passed");
    const email = await SystemEmailTable.findOne({ where: { Title: title }});

    if (!email || !email.Body || !email.Subject) return null;

    const Communication = {
      SenderPersonAliasId: null,
      Status: 3,
      IsBulkCommunication: false,
      Guid: uuid.v4(),
      Subject: email.Subject,
      MediumData: { HtmlMessage: email.Body },
    };

    Communication.Id = await CommunicationTable.post(Communication);

    // this is a bug in Rock right now. We can't set Mandrill on the initial
    // post because it locks everything up, we can however, patch it
    await CommunicationTable.patch(Communication.Id, {
      MediumEntityTypeId: 37, // Mandrill
    });

    return Promise.all(
      people.map((PersonAliasId) => {
        const CommunicationRecipient = {
          PersonAliasId,
          CommunicationId: Communication.Id,
          Status: 0, // Pending
          Guid: uuid.v4(),
          AdditionalMergeValuesJson: JSON.stringify(data),
        };
        return CommunicationRecipientTable.post(CommunicationRecipient);
      }),
    );
  }

  async getAttributesFromEntity(id, key, EntityTypeId) {
    const where = { EntityTypeId };
    if (key) where.Key = key;
    return this.cache.get(`${id}:${key}:getAttributesFromEntity`, () => AttributeModel.find({
      where, 
      include: [
        { model: FieldTypeModel.model },
        { model: AttributeQualifierModel.model },
      ],
    })) 
      .then(y => y.map(x => {
        if (!x) return null;
        const { FieldType } = x;
        // 70
        if (FieldType.Class !== "Rock.Field.Types.DefinedValueFieldType") {
          return [{
            Id: x.Id,
            Value: x.Name,
            Description: x.Description,
            EntityId: id,
          }];
        }
        const definedTypeId = x.AttributeQualifiers
          .filter(y => y.Key === "definedtype");

        return this.getDefinedValuesByTypeId(definedTypeId[0].Value).then(x => ({
          ...x,
          EntityId: id
        }));
      }))
      .then(flatten)

  }

  async getAttributesFromId(id) {
    return this.cache.get(`${id}:getAttributeValues`, () => AttributeModel.findOne({
      where: { Id: id },
      include: [
        { model: FieldTypeModel.model },
        { model: AttributeQualifierModel.model },
      ],
    })
      .then(x => {
        if (!x) return null;
        const { FieldType } = x;
        // 70
        if (FieldType.Class !== "Rock.Field.Types.DefinedValueFieldType") {
          return [{
            Id: x.Id,
            Value: x.Name,
            Description: x.Description,
          }];
        }
        const definedTypeId = x.AttributeQualifiers
          .filter(y => y.Key === "definedtype");

        return this.getDefinedValuesByTypeId(definedTypeId[0].Value);
      })
      .then(flatten)
    );
  }

  async getAttributeValueFromMatrix(key, knownKey, knownValue, desiredKey){
    return this.cache.get(
      `${key}:${knownKey}:${knownValue}:${desiredKey}:MatrixValue`,
      () => CommunicationTable.db.query(`
        SELECT
            desiredValue.*
        FROM
            [Attribute] a
        JOIN [AttributeValue] v
            ON a.Id = v.AttributeId
        JOIN [AttributeMatrix] m
            ON v.Value = m.Guid
        JOIN [AttributeMatrixItem] mi
            ON m.Id = mi.AttributeMatrixId
        JOIN [Attribute] knownColumn
            ON knownColumn.EntityTypeId = 508 AND knownColumn.EntityTypeQualifierValue = mi.Id
        JOIN [AttributeValue] knownColumnValue
            ON knownColumnValue.AttributeId = knownColumn.Id
        JOIN [AttributeValue] desiredValue
            ON knownColumnValue.EntityId = desiredValue.EntityId
        JOIN [Attribute] desiredColumn
            ON desiredColumn.Id = desiredValue.AttributeId
        WHERE
            knownColumn.[Key] = :knownKey
            AND knownColumnValue.Value = :knownValue
            AND desiredColumn.[Key] = :desiredKey
            AND a.[Key] = :key


      `,
        {
          replacements: { key, knownKey, knownValue, desiredKey },
          type: sequelize.QueryTypes.SELECT
        }
      ).then(([x]) => x)
    )
      .then(this.debug)
    // XXX see what kind of value this returns
      // .then(x => Promise.all(x.map(async (y) => {
      //   const value = await this.processAttributeValue.call(context, y);
      //   return {
      //     ...y,
      //     Value: value,
      //   };
      // })))

  }

}


export default {
  Rock,
};
