// schema.js
import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLBoolean,
} from "graphql"


import { load } from "../util/cache"
import { Users } from "../apollos"

import { Transactions, api, parseEndpoint } from "../rock"
import AccountDetail from "./shared/rock/financial-account"
import PaymentDetailsType from "./shared/rock/financial-paymentDetails"

const TransactionDetails = new GraphQLObjectType({
  name: "TransactionDetails",
  description: "A NewSpring Transaction Detail Record",
  fields: () => ({
    id: {
      type: GraphQLInt,
      resolve: transaction => (transaction.AccountId)
    },
    amount: {
      type: GraphQLString,
      resolve: transaction => (transaction.Amount)
    },
    date: {
      type: GraphQLString,
      resolve: transaction => (transaction.CreatedDateTime)
    },
    account: {
      type: AccountDetail,
      resolve: transaction => (transaction.Account)
    }
  })
})

const TransactionType = new GraphQLObjectType({
  name: "Transactions",
  description: "A NewSpring Transaction Record",
  fields: () => ({
    id: {
      type: GraphQLString,
      resolve: transaction => (transaction.Id)
    },
    summary: {
      type: GraphQLString,
      resolve: transaction => (transaction.Summary)
    },
    date: {
      type: GraphQLString,
      resolve: transaction => (transaction.CreatedDateTime)
    },
    details: {
      type: new GraphQLList(TransactionDetails),
      resolve: transaction => (transaction.TransactionDetails)
    },
    payment: {
      type: PaymentDetailsType,
      resolve: transaction => (transaction.FinancialPaymentDetail)
    }
  })
})

const finanicalTransaction = {
  type: TransactionType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLInt) },
  },
  resolve: (_, { id }) => {
    return Transactions.getOne(id)
      .then((transactions) => (transactions[0]))
  }
}

export {
  finanicalTransaction
}

export default {
  type: new GraphQLList(TransactionType),
  args: {
    primaryAliasId: { type: GraphQLInt },
    mongoId: {
      type: GraphQLString
    },
    limit: {
      type: GraphQLInt,
      defaultValue: 20
    },
    skip: {
      type: GraphQLInt,
      defaultValue: 0
    },
    ttl: {
      type: GraphQLInt
    },
    cache: {
      type: GraphQLBoolean,
      defaultValue: true
    },
  },
  resolve: (_, { primaryAliasId, mongoId,  limit, skip, ttl, cache }) => {

    if (!mongoId && !primaryAliasId) {
      throw new Error("An id is required for person lookup")
    }

    let allAccountsQuery = api.parseEndpoint(`
       FinancialAccounts?
        $expand=
          ChildAccounts
        &$filter=
          ChildAccounts/any(ca: Id ne null) or
          (Id ne null and ParentAccountId eq null)
    `)

    let allTransactions;

    if (!primaryAliasId) {
      allTransactions = load(
        JSON.stringify({"user-_id": mongoId }),
        () => (Users.findOne({"_id": mongoId }, "services.rock.PrimaryAliasId"))
      , ttl, cache)
        .then((user) => {
          console.log(user)
          if (user) {
            return Transactions.get(user.services.rock.PrimaryAliasId, limit, skip)
          }
          return []
        })
    } else {
      allTransactions = Transactions.get(primaryAliasId, limit, skip)
    }


    let allAccounts = api.get(allAccountsQuery, {}, ttl, cache)
    return Promise.all([allTransactions, allAccounts])
      .then(([transactions, accounts]) => {

        let accountObj = {};

        for (let account of accounts) {

          for (let child of account.ChildAccounts) {
            child.parent = account.Id
            accountObj[child.Id] = child
          }

          delete account.ChildAccounts

          // map parent account
          accountObj[account.Id] = account
        }


        for (let transaction of transactions) {
          for (let detail of transaction.TransactionDetails) {

            let account = accountObj[detail.AccountId]
            if (account) {
              if (account.parent) {
                detail.Account = accountObj[account.parent]
                continue
              }
              detail.Account = account
            }
          }
        }

        return transactions

      })
  }
}
