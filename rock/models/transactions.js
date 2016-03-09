
import { api, parseEndpoint } from "../api"

const get = (ids, limit, skip, ttl, cache) => {
  let AliasQuery = "("

  let count = 0
  for (let id of ids) {
    count ++
    AliasQuery += `AuthorizedPersonAliasId eq ${id}`
    if (count != ids.length) {
      AliasQuery += " or "
    }
  }

  AliasQuery += ")"

  let query =  api.parseEndpoint(`
    FinancialTransactions?
      $filter=
        ${AliasQuery}
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

const getOne = (id, ids, ttl, cache) => {
  let AliasQuery = "("

  let count = 0
  for (let id of ids) {
    count ++
    AliasQuery += `AuthorizedPersonAliasId eq ${id}`
    if (count != ids.length) {
      AliasQuery += " or "
    }
  }

  AliasQuery += ")"
  
  let query =  api.parseEndpoint(`
    FinancialTransactions?
      $filter=
        Id eq ${id} and
        ${AliasQuery}
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
