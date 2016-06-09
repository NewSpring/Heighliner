
import { flatten } from "lodash";
import { createGlobalId } from "../../../util";

export default {

  Query: {
    campuses: (_, $, { models }) => models.Campus.find(),
  },

  Campus: {
    id: ({ Id }: any, _, $, { parentType }) => createGlobalId(Id, parentType.name),
  },

}