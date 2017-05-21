
import { createGlobalId } from "../../../util";

export default {

  Query: {
    definedValues: (_, { limit, id, skip, all }, { models }) => {
      const query = { offset: skip };
      if (!all) query.limit = limit;

      return models.Rock.getDefinedValuesByTypeId(id, query);
    },
  },

  DefinedValue: {
    id: ({ Id }, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    _id: ({ Id }) => Id,
    value: ({ Value }) => Value,
    description: ({ Description }) => Description,
  },

  Attribute: {
    id: ({ Id }, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    key: ({ Key }) => Key,
    description: ({ Description }) => Description,
    order: ({ Order }) => Order,
    values: ({ Id, EntityId }, _, { models, ...rest }) =>
      models.Rock.getAttributeValuesFromAttributeId(Id, { models, ...rest }, EntityId)
  },

  AttributeValue: {
    attribute: ({ AttributeId }, _, { models }) => models.Rock.getAttributeFromId(AttributeId),
    id: ({ Id }, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    value: ({ Value }) => Value,
  }

};
