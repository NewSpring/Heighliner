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

import { ScheduledTransactions, api, parseEndpoint, getAliasIds } from "../rock"
import AccountDetail from "./shared/rock/financial-account"
import PaymentDetailsType from "./shared/rock/financial-paymentDetails"


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

const scheduledFinanicalTransaction = {
  type: ScheduledTransactionType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLInt) },
    mongoId: { type: GraphQLString },
    ttl: { type: GraphQLInt },
    cache: { type: GraphQLBoolean, defaultValue: true },
  },
  resolve: (_, { id, mongoId, ttl, cache }) => {
    let allAccountsQuery = api.parseEndpoint(`
       FinancialAccounts?
        $expand=
          ChildAccounts
        &$filter=
          ChildAccounts/any(ca: Id ne null) or
          (Id ne null and ParentAccountId eq null)
    `)

    let allAccounts = api.get(allAccountsQuery, {}, ttl, cache)
    let schedules = load(
        JSON.stringify({"user-_id": mongoId }),
        () => (Users.findOne({"_id": mongoId }, "services.rock.PrimaryAliasId"))
      , ttl, cache)
        .then((user) => {
          let personId = user.services.rock.PrimaryAliasId ? user.services.rock.PrimaryAliasId : user.services.rock.PersonId
          if (user) {
            return getAliasIds(personId, ttl, cache)
              .then((ids) => {
                return ScheduledTransactions.getOne(id, ids, ttl, cache)
              })
          }
          return []
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
    mongoId: {
      type: GraphQLString
    },
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
  resolve: (_, { primaryAliasId, mongoId, active, limit, skip, ttl, cache }) => {

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
          if (user) {
            return getAliasIds(user.services.rock.PrimaryAliasId, ttl, cache)
              .then((ids) => {
                return ScheduledTransactions.get(ids, active, limit, skip, ttl, cache)
              })
          }
          return []
        })
    } else {
      allTransactions = getAliasIds(primaryAliasId, ttl, cache)
        .then((ids) => {
          return ScheduledTransactions.get(ids, active, limit, skip, ttl, cache)
        })
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
