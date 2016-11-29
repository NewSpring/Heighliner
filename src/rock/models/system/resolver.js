
import { createGlobalId } from "../../../util";

export default {
  // notes(
  //   limit: Int = 20,
  //   skip: Int = 0,
  //   types: [String],
  // ): [Note]
  Query: {
    definedValues: (_, { limit, id, skip, all }, { models }) => {
      const query = { offset: skip };
      if (!all) query.limit = limit;

      return models.Rock.getDefinedValuesByTypeId(id, query);
    },
    notes: (_, { limit, skip, types }, { models, person }) => {
      if (!person) return null;
      return models.Rock.getNotesByTypes({ types, skip, limit }, { person });
    },
  },

  DefinedValue: {
    id: ({ Id }, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    _id: ({ Id }) => Id,
    value: ({ Value }) => Value,
    description: ({ Description }) => Description,
  },

  Note: {
    id: ({ Id }, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    entityId: ({ EntityId }) => EntityId,
    text: ({ Text }) => Text,
  },

};
