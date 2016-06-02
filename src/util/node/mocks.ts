
import { parseGlobalId } from "./model";

export default {
  Query: {
    node(_: any, { id }: { id: string }): any {
      return parseGlobalId(id);
    },
  },
  Node: () => ({
    __resolveType: (data, _: any, { schema }: any) => {
      console.log("here", data)
      return schema.getType(data.__type);
    },
  }),

}
