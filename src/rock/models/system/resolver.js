
import { createGlobalId } from "../../../util";

export default {

  Query: {
    definedValues: (_, { limit, id, skip, all } , { models }) => {
      let query = { offset: skip } as any;
      if (!all) query.limit = limit;

      return models.Rock.getDefinedValuesByTypeId(id, query);
    },
  },

  DefinedValue: {
    id: ({ Id }: any, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    _id: ({ Id }) => Id,
    value: ({ Value }) => Value,
    description: ({ Description }) => Description,
  },

};
