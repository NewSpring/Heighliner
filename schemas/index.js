
// schema.js
import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
} from 'graphql';

import { People } from "../rock"
import person from "./person"
import allFinanicalTransactions, { finanicalTransaction } from "./finanicalTransactions"
import allFinancialAccounts, { financialAccount } from "./financialAccounts"
import likes from "./likes"
import allContent, { content } from "./content"

let schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      // overarching data
      person,

      // mongo + ee
      likes,

      // ee
      allContent,
      content,


      // rock
      allFinanicalTransactions,
      finanicalTransaction,
      allFinancialAccounts,
      financialAccount
    }
  })
});

export default schema;
