
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
import allScheduledFinanicalTransactions, { scheduledFinanicalTransaction } from "./finanicalScheduledTransactions"
import allSavedPaymentAccounts from "./savedPaymentAccounts"
import allCampuses, { campus } from "./campuses"
import allDefinedValues from "./definedValues"
import allGroups, { group } from "./groups"

import likes from "./likes"
import allContent, { content } from "./content"

let schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      // overarching data
      person,
      campus,
      allCampuses,
      allDefinedValues,
      allGroups,
      group,

      // mongo + ee
      likes,

      // ee
      allContent,
      content,

      // rock financial
      allFinanicalTransactions,
      finanicalTransaction,
      allFinancialAccounts,
      financialAccount,
      allSavedPaymentAccounts,
      scheduledFinanicalTransaction,
      allScheduledFinanicalTransactions,

    }
  })
});

export default schema;
