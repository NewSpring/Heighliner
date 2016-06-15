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
  api,
  parseEndpoint,
  getAliasIds,
  getAliasIdsFromPersonId,
} from "../rock"

import AccountDetail from "./shared/rock/financial-account"
import PaymentDetailsType from "./shared/rock/financial-paymentDetails"

const SavedAccountsType = new GraphQLObjectType({
  name: "SavedAccounts",
  fields: () => ({
    id: {
      type: GraphQLString,
      resolve: account => (account.Id)
    },
    name: {
      type: GraphQLString,
      resolve: account => (account.Name)
    },
    date: {
      type: GraphQLString,
      resolve: account => (account.ModifiedDateTime)
    },
    code: {
      type: GraphQLString,
      resolve: account => (account.ReferenceNumber)
    },
    payment: {
      type: PaymentDetailsType,
      resolve: account => (account.FinancialPaymentDetail)
    }
  })
})

export default {
  type: new GraphQLList(SavedAccountsType),
  args: {
    primaryAliasId: { type: GraphQLInt },
    ttl: {
      type: GraphQLInt
    },
    cache: {
      type: GraphQLBoolean,
      defaultValue: true
    },
  },
  resolve: (_, { ttl, cache }, context) => {

    if (context.user === null || !context.user.services.rock.PrimaryAliasId) {
      throw new Error("No person found")
    }

    function get(ids) {
      let AliasQuery = "("

      let count = 0
      for (let id of ids) {
        count ++
        AliasQuery += `PersonAliasId eq ${id}`
        if (count != ids.length) {
          AliasQuery += " or "
        }
      }

      AliasQuery += ")"

      const query = parseEndpoint(`
        FinancialPersonSavedAccounts?
          $filter=
            ${AliasQuery}
          &$expand=
            FinancialPaymentDetail,
            FinancialPaymentDetail/CreditCardTypeValue,
            FinancialPaymentDetail/CurrencyTypeValue
          &$select=
            Id,
            Name,
            ModifiedDateTime,
            ReferenceNumber,
            TransactionCode,
            FinancialPaymentDetail/AccountNumberMasked,
            FinancialPaymentDetail/CurrencyTypeValue/Value,
            FinancialPaymentDetail/CurrencyTypeValue/Description,
            FinancialPaymentDetail/CreditCardTypeValue/Value,
            FinancialPaymentDetail/CreditCardTypeValue/Description
          &$orderby=
            ModifiedDateTime desc
      `)

      return api.get(query, {}, ttl, cache)
    }


    let allPaymentDetails = getAliasIds(context.user.services.rock.PrimaryAliasId, ttl, cache)
      .then((ids) => {
        return get(ids)
      })

    return allPaymentDetails
  }
}
