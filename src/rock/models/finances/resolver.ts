
import { createGlobalId } from "../../../util";

export default {

  Query: {
    savedPayments: (_, { limit, cache, skip } , { models, person }) => {
      return models.SavedPayment.findByPersonAlias(person.aliases, {
          limit, offset: skip,
        }, { cache }
      );
    },
    transactions: (_, { limit, cache, skip } , { models, person }) => {
      return models.Transaction.findByPersonAlias(person.aliases, { limit, offset: skip}, { cache });
    },
    scheduledTransactions: (_, { limit, cache, skip, isActive } , { models, person }) => {
      return models.ScheduledTransaction.findByPersonAlias(person.aliases, {
        limit, offset: skip, isActive,
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
    details: ({ Id, FinancialScheduledTransactionDetails }, _, { models }) => {
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
    },
  },

  Transaction: {
    id: ({ Id }: any, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    summary: ({ Summary }) => Summary,
    date: ({ TransactionDateTime, CreatedDate, ModifiedDate }) => (TransactionDateTime || ModifiedDate || CreatedDate),
    details: ({ Id, TransactionDetails }, _, { models }) => {
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
    image: ({ Url, ImageBinaryFieldId }, _, { models }) => { // tslint:disable-line
      if (Url) return Url;

      return;
      // XXX
      // return models.BinaryFiles.getFromFieldId(ImageBinaryFieldId);
    },
    end: ({ EndDate }) => EndDate,
    start: ({ StartDate }) => StartDate,
    images: ({ Id }, _, { models }) => { // tslint:disable-line
      let field_id = "field_id_1513"; // rock account id
      let channel_id = "69"; // give items
      return models.Content.getEntryFromFieldValue(Id, field_id, channel_id)
        .then(({ image, exp_channel, entry_id }) => {
          if (!image) return Promise.resolve([]);

          let position;
          if (image) {
            position = Number(exp_channel.exp_channel_fields.image.split("_").pop());
          }

        return models.File.getFilesFromContent(entry_id, image, position);
      });
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

};
