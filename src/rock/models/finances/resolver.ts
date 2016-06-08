
import { createGlobalId } from "../../../util";

export default {

  Query: {
    savedPayments: (_, $, { models }) => models.SavedPayments.get(),
    transactions: (_, $, { models }) => models.Transcations.get(),
    scheduledTransactions: (_, $, { models }) => models.ScheduledTransactions.get(),
    financialAccounts: (_, args, { models }) => models.FinancialAccounts.find(args),
  },

  ScheduleFrequency: {
    value: ({ Value }) => Value,
    description: ({ Description }) => Description,
  },

  TransactionDetail: {
    id: ({ Id }: any, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    amount: ({ Amount }) => Amount,
    date: ({ CreatedDate, ModifiedDate }) => (ModifiedDate || CreatedDate),
    account: ({ AccountId, Account }, _, { models }) => {
      if (Account) return Account;

      const globalId = createGlobalId(AccountId, "FinancialAccount");
      return models.FinancialAccount.getById(AccountId, globalId)
    },
  },

  ScheduledTransaction: {
    id: ({ Id }: any, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    reminderDate: ({ ReminderDate }) => ReminderDate,
    start: ({ StartDate }) => StartDate,
    next: ({ NextPaymentDate }) => NextPaymentDate,
    end: ({ EndDate }) => EndDate,
    code: ({ TransactionCode }) => TransactionCode,
    gateway: ({ GatewayId }) => createGlobalId(GatewayId, "FinancialGateway"),
    numberOfPayments: ({ NumberOfPayments }) => NumberOfPayments,
    date: ({ CreatedDate, ModifiedDate }) => (ModifiedDate || CreatedDate),
    details: ({ Id, ScheduledTransactionDetails }, _, { models }, { parentType }) => {
      if (ScheduledTransactionDetails) return ScheduledTransactionDetails;

      return models.ScheduledTransactions.getDetailsByScheduleId(Id);
    },
    schedule: ({ ScheduleFrequencyId, ScheduleFrequency }, _, { models }) => {
      if (ScheduleFrequency) return ScheduleFrequency;

      return models.ScheduledTransaction.getScheduleFrequency(ScheduleFrequencyId);
    },
    payment: ({ PaymentDetailId, PaymentDetail }, _, { models }) => {
      if (PaymentDetail) return PaymentDetail;

      return models.ScheduledTransaction.getPaymentDetailsById(PaymentDetailId);
    },
  },

  Transaction: {
    id: ({ Id }: any, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    summary: ({ Summary }) => Summary,
    date: ({ CreatedDate, ModifiedDate }) => (ModifiedDate || CreatedDate),
    details: ({ Id, TransactionDetails }, _, { models }, { parentType }) => {
      if (TransactionDetails) return TransactionDetails;

      return models.Transactions.getDetailsById(Id);
    },
    payment: ({ PaymentDetailId, PaymentDetail }, _, { models }) => {
      if (PaymentDetail) return PaymentDetail;

      return models.ScheduledTransaction.getPaymentDetailsById(PaymentDetailId);
    },
  },

  FinancialAccount: {
    id: ({ Id }: any, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    name: ({ Name }) => Name,
    order: ({ Order }) => Order,
    description: ({ Description }) => Description,
    summary: ({ Summary }) => Summary,
    image: ({ Url, ImageBinaryFieldId }, _, { models }) => {
      if (Url) return Url;

      return;
      // XXX
      // return models.BinaryFiles.getFromFieldId(ImageBinaryFieldId);
    },
    end: ({ EndDate }) => EndDate,
    start: ({ StartDate }) => StartDate,
    images: ({ Id }, _, { models }) => {

      return []
      // XXX
      // return models.File.getByFieldValue({ })
    },
  },

  PaymentDetail: {
    id: ({ Id }: any, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    accountNumber: ({ AccountNumberMasked }) => AccountNumberMasked,
    paymentType: ({
      CurrencyTypeValueId,
      CurrencyTypeValue,
      CreditCardTypeValueId,
      CreditCardTypeValue,
    }, _, { models }) => {

      return ""

      // XXX
      if (CreditCardTypeValueId && CreditCardTypeValue) return CreditCardTypeValue;

      if (CreditCardTypeValueId) {
        return models.Transactions.getPaymentTypeById(CreditCardTypeValueId, "CreditCard");
      }

      if (CurrencyTypeValueId && CurrencyTypeValue) return CurrencyTypeValue;

      return models.Transactions.getPaymentTypeById(CurrencyTypeValueId);
    },
  },

  SavedAccount: {
    id: ({ Id }: any, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    name: ({ Name }) => Name,
    guid: ({ Guid }) => Guid,
    code: ({ ReferenceNumber }) => ReferenceNumber,
    date: ({ CreatedDate, ModifiedDate }) => (ModifiedDate || CreatedDate),
    payment: ({ PaymentDetailId, PaymentDetail }, _, { models }) => {
      if (PaymentDetail) return PaymentDetail;

      return models.SavedAccounts.getPaymentDetailsById(PaymentDetailId);
    },
  },

}