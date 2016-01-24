
import { api, parseEndpoint } from "../api"

const get = (id, active = true, limit, skip) => {
  let query =  api.parseEndpoint(`
    FinancialScheduledTransactions?
      $filter=
        AuthorizedPersonAliasId eq ${id} and
        IsActive eq ${active}
      &$expand=
        ScheduledTransactionDetails,
        TransactionFrequencyValue,
        FinancialPaymentDetail,
        FinancialPaymentDetail/CreditCardTypeValue,
        FinancialPaymentDetail/CurrencyTypeValue
      &$select=
        Id,
        CardReminderDate,
        ScheduledTransactionDetails/Amount,
        ScheduledTransactionDetails/AccountId,
        EndDate,
        StartDate,
        NextPaymentDate,
        TransactionFrequencyValue/Value,
        TransactionFrequencyValue/Description,
        FinancialPaymentDetail/CreditCardTypeValue/Value,
        FinancialPaymentDetail/CreditCardTypeValue/Description,
        FinancialPaymentDetail/CurrencyTypeValue/Value,
        FinancialPaymentDetail/CurrencyTypeValue/Description,
        FinancialPaymentDetail/AccountNumberMasked,
        TransactionCode,
        GatewayScheduleId,
        NumberOfPayments,
        FinancialPaymentDetail/CurrencyTypeValueId,
        FinancialPaymentDetail/Id,
        ScheduledTransactionDetails/Summary,
        ScheduledTransactionDetails/AccountId,
        ScheduledTransactionDetails/ScheduledTransactionId,
        ScheduledTransactionDetails/Summary
      &$top=${limit}
      &$skip=${skip}
      &$orderby=
        CreatedDateTime desc
  `)

  return api.get(query)
}

const getOne = (id) => {
  let query =  api.parseEndpoint(`
    FinancialScheduledTransactions?
      $filter=
        Id eq ${id}
      &$expand=
        ScheduledTransactionDetails,
        TransactionFrequencyValue,
        FinancialPaymentDetail,
        FinancialPaymentDetail/CreditCardTypeValue,
        FinancialPaymentDetail/CurrencyTypeValue
      &$select=
        Id,
        CardReminderDate,
        ScheduledTransactionDetails/Amount,
        ScheduledTransactionDetails/AccountId,
        EndDate,
        StartDate,
        NextPaymentDate,
        TransactionFrequencyValue/Value,
        TransactionFrequencyValue/Description,
        FinancialPaymentDetail/CreditCardTypeValue/Value,
        FinancialPaymentDetail/CreditCardTypeValue/Description,
        FinancialPaymentDetail/CurrencyTypeValue/Value,
        FinancialPaymentDetail/CurrencyTypeValue/Description,
        FinancialPaymentDetail/AccountNumberMasked,
        TransactionCode,
        GatewayScheduleId,
        NumberOfPayments,
        FinancialPaymentDetail/CurrencyTypeValueId,
        FinancialPaymentDetail/Id,
        ScheduledTransactionDetails/Summary,
        ScheduledTransactionDetails/AccountId,
        ScheduledTransactionDetails/ScheduledTransactionId,
        ScheduledTransactionDetails/Summary
`)

  console.log(query)
  return api.get(query)
}

export default {
  get,
  getOne
}
