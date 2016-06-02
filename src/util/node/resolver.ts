
export default {
  Query: {
    node(_: any, { id }: { id: string }, { models }: any): any {
      return models.Node.get(id);
    },
  },
  Node: {
    __resolveType: ({ __type }: { __type: string }, _: any, { schema }: any) => {
      return schema.getType(__type);
    },
  },
}
