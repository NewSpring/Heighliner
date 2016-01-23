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

import { api, parseEndpoint } from "../rock"
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
      resolve: account => (account.TransactionCode)
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
    mongoId: {
      type: GraphQLString
    },
    ttl: {
      type: GraphQLInt
    },
    cache: {
      type: GraphQLBoolean,
      defaultValue: true
    },
  },
  resolve: (_, { primaryAliasId, mongoId, ttl, cache }) => {

    if (!mongoId && !primaryAliasId) {
      throw new Error("An id is required for payment detail lookup")
    }

    function get(id) {
      const query = parseEndpoint(`
        FinancialPersonSavedAccounts?
          $filter=
            PersonAliasId eq ${id}
          &$expand=
            FinancialPaymentDetail,
            FinancialPaymentDetail/CreditCardTypeValue,
            FinancialPaymentDetail/CurrencyTypeValue
          &$select=
            Id,
            Name,
            ModifiedDateTime,
            TransactionCode,
            FinancialPaymentDetail/AccountNumberMasked,
            FinancialPaymentDetail/CurrencyTypeValue/Value,
            FinancialPaymentDetail/CurrencyTypeValue/Description,
            FinancialPaymentDetail/CreditCardTypeValue/Value,
            FinancialPaymentDetail/CreditCardTypeValue/Description
      `)

      return api.get(query, {}, ttl, cache)
    }


    let allPaymentDetails;
    if (!primaryAliasId) {
      allPaymentDetails = load(
        JSON.stringify({"user-_id": mongoId }),
        () => (Users.findOne({"_id": mongoId }, "services.rock.PrimaryAliasId"))
      , ttl, cache)
        .then((user) => {

          if (user) {
            return get(user.services.rock.PrimaryAliasId)
          }
          return []
        })
    } else {
      allPaymentDetails = get(primaryAliasId)
    }


    return allPaymentDetails
  }
}
