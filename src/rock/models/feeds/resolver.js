
const resolverMap = {
  Node: {
    __resolveType(root, context, info) {
      if (root.schedule) {
        return info.schema.getType("Transaction");
      }

      if (root.guid && root.name) {
        return info.schema.getType("SavedPayment");
      }

      return null;
    },
  },
};

export default {

  Query: {
    userFeed: (_, { filters }, { models, person }) => {
      if (!person) return null;

      if (filters.includes("GIVING_DASHBOARD")) {
        return Promise.all([
          models.Transaction.findByPersonAlias(
            person.aliases, { limit: 3, offset: 0 }, { cache: null },
          ),
          models.SavedPayment.findByPersonAlias(
            person.aliases, { limit: 3, offset: 0 }, { cache: null },
          ),
        ])
          .then(([txns, payments]) => [...txns, ...payments]
            .map((x) => {
              if (x.Name) x.__type = "SavedPayment";
              else x.__type = "Transaction";
              return x;
            }));
      }

      return null;
    },
  },
};
