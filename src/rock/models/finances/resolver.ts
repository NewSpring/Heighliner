
import { createGlobalId } from "../../../util";

export default {

  Query: {
    savedPayments: (_, { limit, cache, skip } , { models, person }) => {
      return models.SavedPayment.findByPersonAlias(person.aliases, {
          limit, offset: skip
        }, { cache }
      );
    },
    transactions: (_, { limit, cache, skip } , { models, person }) => {
      return models.Transaction.findByPersonAlias(person.aliases, { limit, offset: skip}, { cache });
    },
    scheduledTransactions: (_, { limit, cache, skip, isActive } , { models, person }) => {
      return models.ScheduledTransaction.findByPersonAlias(person.aliases, {
        limit, offset: skip, isActive
      }, { cache });
    },
    accounts: (_, { name, isActive, isPublic }, { models }) => {
      return models.FinancialAccount.find({
        Name: name,
        IsActive: isActive,
        IsPublic: isPublic,
      });
    },
  },

  ScheduleFrequency: {
    value: ({ Value }) => Value,
    description: ({ Description }) => Description,
  },

  TransactionDetail: {
    id: ({ Id }: any, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    amount: ({ Amount }) => Amount,
    account: ({ AccountId, Account }, _, { models }) => {
      if (Account) return Account;

      return models.FinancialAccount.getFromId(AccountId);
    },
  },

  ScheduledTransaction: {
    id: ({ Id }: any, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    reminderDate: ({ ReminderDate }) => ReminderDate,
    start: ({ StartDate }) => StartDate,
    next: ({ NextPaymentDate }) => NextPaymentDate,
    end: ({ EndDate }) => EndDate,
    code: ({ TransactionCode }) => TransactionCode,
    gateway: ({ FinancialGatewayId }) => FinancialGatewayId,
    numberOfPayments: ({ NumberOfPayments }) => NumberOfPayments,
    date: ({ CreatedDate, ModifiedDate }) => (ModifiedDate || CreatedDate),
    details: ({ Id, FinancialScheduledTransactionDetails }, _, { models }, { parentType }) => {
      if (FinancialScheduledTransactionDetails) return FinancialScheduledTransactionDetails;

      return models.ScheduledTransaction.getDetailsByScheduleId(Id);
    },
    schedule: ({ TransactionFrequencyValueId, TransactionFrequencyValue }, _, { models }) => {
      if (TransactionFrequencyValue) return TransactionFrequencyValue;
      return models.ScheduledTransaction.getDefinedValueId(TransactionFrequencyValueId);
    },
    payment: ({ FinancialPaymentDetailId, FinancialPaymentDetail }, _, { models }) => {
      if (FinancialPaymentDetail) return FinancialPaymentDetail;

      return models.Transaction.getPaymentDetailsById(FinancialPaymentDetailId);
    },
    transactions: ({ Id }, _, { models }) => {
      return models.ScheduledTransaction.getTransactionsById(Id);
    }
  },

  Transaction: {
    id: ({ Id }: any, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    summary: ({ Summary }) => Summary,
    date: ({ TransactionDateTime, CreatedDate, ModifiedDate }) => (TransactionDateTime ||ModifiedDate || CreatedDate),
    details: ({ Id, TransactionDetails }, _, { models }, { parentType }) => {
      if (TransactionDetails) return TransactionDetails;

      return models.Transaction.getDetailsById(Id);
    },
    payment: ({ FinancialPaymentDetailId, FinancialPaymentDetail }, _, { models }) => {
      if (FinancialPaymentDetail) return FinancialPaymentDetail;

      return models.Transaction.getPaymentDetailsById(FinancialPaymentDetailId);
    },
  },

  FinancialAccount: {
    id: ({ Id }: any, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    name: ({ Name }) => Name,
    order: ({ Order }) => Order,
    description: ({ PublicDescription }) => PublicDescription,
    summary: ({ Description }) => Description,
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

      if (CreditCardTypeValueId && CreditCardTypeValue) return CreditCardTypeValue.Value;
      if (CreditCardTypeValueId) {
        return models.Transaction.getDefinedValueId(CreditCardTypeValueId)
          .then(x => x.Value);
      }

      if (CurrencyTypeValueId && CurrencyTypeValue) return CurrencyTypeValue.Value;
      return models.Transaction.getDefinedValueId(CurrencyTypeValueId)
        .then(x => x.Value);
    },
  },

  SavedPayment: {
    id: ({ Id }: any, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    name: ({ Name }) => Name,
    guid: ({ Guid }) => Guid,
    code: ({ ReferenceNumber }) => ReferenceNumber,
    date: ({ CreatedDate, ModifiedDate }) => (ModifiedDate || CreatedDate),
    payment: ({ FinancialPaymentDetailId, FinancialPaymentDetail }, _, { models }) => {
      if (FinancialPaymentDetail) return FinancialPaymentDetail;

      return models.Transaction.getPaymentDetailsById(FinancialPaymentDetailId);
    },
  },

}