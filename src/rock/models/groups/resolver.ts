
import { createGlobalId } from "../../../util";

export default {

  Query: {
    groups: (_, { name, id }, { models }) => models.Group.find({ Id: id, Name: name }),
  },

  Group: {
    id: ({ Id }: any, _, $, { parentType }) => createGlobalId(Id, parentType.name),
  },

};
