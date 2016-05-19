
import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
} from "graphql"

import ImageType from "../EE/image"
import { getImagesFromAccount } from "../../../ee/mysql"

const AccountDetail = new GraphQLObjectType({
  name: "FinancialAccount",
  fields: () => ({
    name: {
      type: GraphQLString,
      resolve: account => (account.PublicName)
    },
    order: {
      type: GraphQLInt,
      resolve: account => (account.Order)
    },
    description: {
      type: GraphQLString,
      resolve: account => (account.PublicDescription)
    },
    summary: {
      type: GraphQLString,
      resolve: account => (account.Description)
    },
    id: {
      type: GraphQLInt,
      resolve: account => (account.Id)
    },
    image: {
      type: GraphQLString,
      resolve: account => (account.Url)
    },
    end: {
      type: GraphQLString,
      resolve: account => (account.EndDate)
    },
    start: {
      type: GraphQLString,
      resolve: account => (account.Start)
    },
    images: {
      type: new GraphQLList(ImageType),
      resolve: account => getImagesFromAccount(account.Id)
    },
  })
})

export default AccountDetail
