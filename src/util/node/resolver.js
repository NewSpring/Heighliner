export default {
  Query: {
    node: (_, { id }, { models }) => models.Node.get(id),
  },
  Node: {
    __resolveType: ({ __type }, _, { schema }) => schema.getType(__type),
  },
};
