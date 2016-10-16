
import { createGlobalId } from "../../../util";

export default {

  Query: {
    savedPayments: (_, { limit, cache, skip } , { models, person }) => {
      if (!person) return null;
      return models.SavedPayment.findByPersonAlias(person.aliases, {
          limit, offset: skip,
        }, { cache }
      );
    },
    transactions: (_, { people, start, end, limit, cache, skip } , { models, person }) => {
      if (!person) return null;
      if (person.GivingGroupId) {
        return models.Transaction.findByGivingGroup(
          {
            id: person.GivingGroupId,
            include: people,
            start,
            end,
          }, { limit, offset: skip }, { cache }
        );
      }
      return models.Transaction.findByPersonAlias(
        person.aliases, { limit, offset: skip}, { cache }
      );
    },
    scheduledTransactions: (_, { limit, cache, skip, isActive } , { models, person }) => {
      if (!person) return null;
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
    accountFromCashTag: (_, { cashTag }, { models }) => {
      return models.FinancialAccount.find({
        IsActive: true,
        IsPublic: true,
      })
        .then(x => {
          let correctAccount = null;
          for (let account of x) {
            let cashTagName = account.PublicName
              .replace(/\s+/g, "")
              .toLowerCase();
            if (cashTagName === cashTag.replace("$", "")) {
              correctAccount = account;
              break;
            }
          }
          return correctAccount;
        });
    },
  },

  Mutation: {
    syncTransactions: (_, args, { models }) => models.Transaction.syncTransactions(args),
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
    entityId: ({ Id }) => Id,
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
    entityId: ({ Id }) => Id,
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
    person: ({ AuthorizedPersonAliasId }, _, { models }) => {
      return models.Person.getFromAliasId(AuthorizedPersonAliasId);
    },
  },

  FinancialAccount: {
    id: ({ Id }: any, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    entityId: ({ Id }) => Id,
    name: ({ PublicName }) => PublicName,
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
    entityId: ({ Id }) => Id,
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
