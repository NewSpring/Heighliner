
import { api, parseEndpoint } from "../api"

const get = (id, limit, skip, ttl, cache) => {
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

  return api.get(query, {}, ttl, cache)
}

const getOne = (id, PersonAliasId, ttl, cache) => {
  let query =  api.parseEndpoint(`
    FinancialTransactions?
      $filter=
        Id eq ${id} and
        AuthorizedPersonAliasId eq ${PersonAliasId}
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

  return api.get(query, {}, ttl, cache)
}

export default {
  get,
  getOne
}
