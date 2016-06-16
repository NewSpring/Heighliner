
import { createGlobalId } from "../../../util";

export default {

  Query: {
    groups: (_, { name, id, attributes }, { models }) => {
      if (attributes) return models.Group.findByAttributes(attributes);

      return models.Group.find({ Id: id, Name: name });
    },
  },

  Group: {
    id: ({ Id }: any, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    name: ({ Name }) => Name,
    description: ({ Description }) => Description,
    active: ({ IsActive }) => IsActive,
    photo: (data) => {
      // console.log(data.AttributeValues)
      return "XXX";
    },
  },

};
