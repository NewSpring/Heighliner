
import { api, parseEndpoint } from "../api"

const get = (id, limit, skip) => {
  let query =  api.parseEndpoint(`
    FinancialTransactions?
      $filter=
        AuthorizedPersonAliasId eq ${id}
      &$expand=
        TransactionDetails,
        FinancialPaymentDetail,
        FinancialPaymentDetail/CurrencyTypeValue,
        FinancialPaymentDetail/CreditCardTypeValue
      &$select=
        Id,
        CreatedDateTime,
        Summary,
        AuthorizedPersonAliasId,
        TransactionDetails/Amount,
        TransactionDetails/AccountId,
        TransactionDetails/CreatedDateTime,
        FinancialPaymentDetail/CurrencyTypeValue/Description,
        FinancialPaymentDetail/CurrencyTypeValue/Value,
        FinancialPaymentDetail/CreditCardTypeValue/Description,
        FinancialPaymentDetail/CreditCardTypeValue/Value,
        FinancialPaymentDetail/AccountNumberMasked,
        FinancialPaymentDetail/Id
      &$top=${limit}
      &$skip=${skip}
      &$orderby=
        CreatedDateTime desc
  `)

  return api.get(query)
}

const getOne = (id) => {
  let query =  api.parseEndpoint(`
    FinancialTransactions?
      $filter=
        Id eq ${id}
      &$expand=
        TransactionDetails,
        FinancialPaymentDetail,
        FinancialPaymentDetail/CurrencyTypeValue,
        FinancialPaymentDetail/CreditCardTypeValue
      &$select=
        Id,
        CreatedDateTime,
        Summary,
        AuthorizedPersonAliasId,
        TransactionDetails/Amount,
        TransactionDetails/AccountId,
        TransactionDetails/CreatedDateTime,
        FinancialPaymentDetail/CurrencyTypeValue/Description,
        FinancialPaymentDetail/CurrencyTypeValue/Value,
        FinancialPaymentDetail/CreditCardTypeValue/Description,
        FinancialPaymentDetail/CreditCardTypeValue/Value,
        FinancialPaymentDetail/AccountNumberMasked,
        FinancialPaymentDetail/Id
  `)

  return api.get(query)
}

export default {
  get,
  getOne
}
