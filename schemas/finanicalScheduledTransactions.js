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

import {
  ScheduledTransactions,
  api,
  parseEndpoint,
  getAliasIds,
  getAliasIdsFromPersonId,
} from "../rock"

import AccountDetail from "./shared/rock/financial-account"
import PaymentDetailsType from "./shared/rock/financial-paymentDetails"

import Auth from "./auth";

const ScheduledTransactionDetails = new GraphQLObjectType({
  name: "ScheduledTransactionDetails",
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
      resolve: transaction => {
        if (transaction.AccountId && !transaction.Account) {
          let allAccountsQuery = api.parseEndpoint(`
             FinancialAccounts/${transaction.AccountId}
          `)
          return api.get(allAccountsQuery)
        }

        return transaction.Account
      }
    }
  })
})


const ScheduledFrequencyType = new GraphQLObjectType({
  name: "ScheduledFrequency",
  fields: () => ({
    value: {
      type: GraphQLString,
      resolve: transaction => (transaction.Value)
    },
    description: {
      type: GraphQLString,
      resolve: transaction => (transaction.Description)
    },
  })
})

const ScheduledTransactionType = new GraphQLObjectType({
  name: "ScheduledTransactions",
  description: "A NewSpring Transaction Record",
  fields: () => ({
    id: {
      type: GraphQLString,
      resolve: transaction => (transaction.Id)
    },
    reminderDate: {
      type: GraphQLString,
      resolve: transaction => (transaction.CardReminderDate)
    },
    start: {
      type: GraphQLString,
      resolve: transaction => (transaction.StartDate)
    },
    next: {
      type: GraphQLString,
      resolve: transaction => (transaction.NextPaymentDate)
    },
    code: {
      type: GraphQLString,
      resolve: transaction => (transaction.TransactionCode)
    },
    gateway: {
      type: GraphQLString,
      resolve: transaction => (transaction.GatewayScheduleId)
    },
    end: {
      type: GraphQLString,
      resolve: transaction => (transaction.EndDate)
    },
    numberOfPayments: {
      type: GraphQLString,
      resolve: transaction => (transaction.numberOfPayments)
    },
    date: {
      type: GraphQLString,
      resolve: transaction => (transaction.CreatedDateTime)
    },
    details: {
      type: new GraphQLList(ScheduledTransactionDetails),
      resolve: transaction => (transaction.ScheduledTransactionDetails)
    },
    schedule: {
      type: ScheduledFrequencyType,
      resolve: transaction => (transaction.TransactionFrequencyValue)
    },
    payment: {
      type: PaymentDetailsType,
      resolve: transaction => (transaction.FinancialPaymentDetail)
    }
  })
})

// secured by using user token to lookup rock id
const scheduledFinanicalTransaction = {
  type: ScheduledTransactionType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLInt) },
    ttl: { type: GraphQLInt },
    cache: { type: GraphQLBoolean, defaultValue: true },
  },
  resolve: (_, { id, ttl, cache }, context) => {

    if (context.user === null || !context.user.services.rock.PrimaryAliasId) {
      throw new Error("No person found")
    }

    let allAccountsQuery = api.parseEndpoint(`
       FinancialAccounts?
        $expand=
          ChildAccounts
        &$filter=
          ChildAccounts/any(ca: Id ne null) or
          (Id ne null and ParentAccountId eq null)
    `)

    let allAccounts = api.get(allAccountsQuery, {}, ttl, cache)

    let personId = context.user.services.rock.PrimaryAliasId ?
      user.services.rock.PrimaryAliasId :
        user.services.rock.PersonId;

    let schedules = getAliasIds(personId, ttl, cache)
      .then((ids) => {
        return ScheduledTransactions.getOne(id, ids, ttl, cache)
      })

    return Promise.all([schedules, allAccounts])
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
          for (let detail of transaction.ScheduledTransactionDetails) {

            let account = accountObj[detail.AccountId]
            if (account) {
              detail.Account = account
              if (account.ParentAccountId) {
                detail.Account = accountObj[account.ParentAccountId]
              }
            }
          }
        }
        return transactions
      })
      .then((transactions) => (transactions[0]))
  }
}

export {
  scheduledFinanicalTransaction
}

export default {
  type: new GraphQLList(ScheduledTransactionType),
  args: {
    primaryAliasId: { type: GraphQLInt },
    active: {
      type: GraphQLBoolean,
      defaultValue: true
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
  resolve: (_, { active, limit, skip, ttl, cache }, context) => {

    if (context.user === null || !context.user.services.rock.PrimaryAliasId) {
      throw new Error("No person found")
    }

    let allAccountsQuery = api.parseEndpoint(`
       FinancialAccounts?
        $expand=
          ChildAccounts
        &$filter=
          ChildAccounts/any(ca: Id ne null) or
          (Id ne null and ParentAccountId eq null)
    `)

    let allTransactions = getAliasIds(context.user.services.rock.PrimaryAliasId, ttl, cache)
      .then((ids) => {
        return ScheduledTransactions.get(ids, active, limit, skip, ttl, cache)
      })

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
          for (let detail of transaction.ScheduledTransactionDetails) {

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
