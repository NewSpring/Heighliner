// schema.js
import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
} from "graphql"

import Promise from "bluebird"
import { api, parseEndpoint } from "../rock"
import AccountDetail from "./shared/rock/financial-account"

const financialAccount = {
  type: AccountDetail,
  args: {
    id: { type: new GraphQLNonNull(GraphQLInt) }
  },
  resolve: (_, { id }) => {
    let accountsQuery = api.parseEndpoint(`FinancialAccounts/${id}`)

    return api.get(accountsQuery)
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
  },
  resolve: (_, { limit, skip, ttl }) => {
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

    return api.get(allAccountsQuery, {}, ttl)
      .then((accounts) => {
        return accounts
      })
  }
}
