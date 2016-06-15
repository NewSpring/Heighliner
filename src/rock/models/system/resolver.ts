
import { createGlobalId } from "../../../util";

export default {

  Query: {
    definedValues: (_, { limit, id, skip } , { models }) => {
      return models.Rock.getDefinedValuesByTypeId(id, { limit, offset: skip});
    },
  },

  DefinedValue: {
    id: ({ Id }: any, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    value: ({ Value }) => Value,
    description: ({ Description }) => Description,
  },

};
