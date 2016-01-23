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


const PaymentDetailsType = new GraphQLObjectType({
  name: "PaymentDetails",
  fields: () => ({
    id: {
      type: GraphQLInt,
      resolve: payment => (payment.Id)
    },
    accountNumber: {
      type: GraphQLString,
      resolve: payment => (payment.AccountNumberMasked)
    },
    paymentType: {
      type: GraphQLString,
      resolve: payment => {
        if (payment.CurrencyTypeValue.Value === "Credit Card" ) {
          return payment.CreditCardTypeValue.Value
        }
        return payment.CurrencyTypeValue.Value
      }
    },
  })
})


export default PaymentDetailsType
