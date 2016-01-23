// schema.js
import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLInt,
  GraphQLString,
  GraphQLBoolean,
  GraphQLList,
  GraphQLNonNull,
} from "graphql"

import Promise from "bluebird"
import { api, parseEndpoint } from "../rock"
import AccountDetail from "./shared/rock/financial-account"

const financialAccount = {
  type: AccountDetail,
  args: {
    id: { type: GraphQLInt },
    name: { type: GraphQLString },
    ttl: { type: GraphQLInt },
    cache: {
      type: GraphQLBoolean,
      defaultValue: true
    },
  },
  resolve: (_, { id, name, ttl, cache }) => {
    if (!id && !name) {
      throw new Error("Id or Name is required")
    }

    let accountsQuery;
    if (id) {
      accountsQuery = api.parseEndpoint(`FinancialAccounts/${id}`)
    } else if (name) {
      accountsQuery = api.parseEndpoint(`
        FinancialAccounts?
          $filter=
            Name eq '${name}'
      `)
    }

    return api.get(accountsQuery, {}, ttl, cache)
      .then((data) => {
        if (data.length === 1) {
          data = data[0]
        }

        return data
      })
  }
}

export {
  financialAccount
}

export default {
  type: new GraphQLList(AccountDetail),
  args: {
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
  resolve: (_, { limit, skip, ttl, cache }) => {
    let allAccountsQuery = api.parseEndpoint(`
       FinancialAccounts?
        $expand=
          ChildAccounts
        &$filter=
          ChildAccounts/any(ca: Id ne null) or
          (Id ne null and ParentAccountId eq null)
        &$top=${limit}
        &$skip=${skip}
        &$orderby=
          CreatedDateTime asc
    `)

    return api.get(allAccountsQuery, {}, ttl, cache)
      .then((accounts) => {
        return accounts
      })
  }
}
