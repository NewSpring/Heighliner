
export default {
  // Query: () => {
  //   node(_: any, { id }: { id: string }, { models }: any): any {
  //     return models.Node.get(id);
  //   },
  // },
  Node: () => ({
    __resolveType: (data, _: any, { schema }: any) => {
        return schema.getType(data.__type);
      },
  }),

}
