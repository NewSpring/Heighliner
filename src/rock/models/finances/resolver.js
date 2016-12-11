import { flatten } from "lodash";

import { createGlobalId } from "../../../util";

const MutationReponseResolver = {
  error: ({ error }) => error,
  success: ({ success, error }) => success || !error,
  code: ({ code }) => code,
};

export default {

  Query: {
    savedPayments: (_, { limit, cache, skip }, { models, person }) => {
      if (!person) return null;
      return models.SavedPayment.findByPersonAlias(person.aliases, {
        limit, offset: skip,
      }, { cache },
      );
    },
    transactions: (_, { people, start, end, limit, cache, skip }, { models, person }) => {
      if (!person) return null;
      if (person.GivingGroupId) {
        return models.Transaction.findByGivingGroup(
          {
            id: person.GivingGroupId,
            include: people,
            start,
            end,
          }, { limit, offset: skip }, { cache },
        );
      }
      return models.Transaction.findByPersonAlias(
        person.aliases, { limit, offset: skip }, { cache },
      );
    },
    scheduledTransactions: (_, { limit, cache, skip, isActive }, { models, person }) => {
      if (!person) return null;
      return models.ScheduledTransaction.findByPersonAlias(person.aliases, {
        limit, offset: skip, isActive,
      }, { cache });
    },
    accounts: (_, { name, isActive, isPublic }, { models }) =>
       models.FinancialAccount.find({
         Name: name,
         IsActive: isActive,
         IsPublic: isPublic,
       }),
    accountFromCashTag: (_, { cashTag }, { models }) =>
       models.FinancialAccount.find({
         IsActive: true,
         IsPublic: true,
       })
        .then((x) => {
          let correctAccount = null;
          for (const account of x) {
            const cashTagName = account.PublicName
              .replace(/\s+/g, "")
              .toLowerCase();
            if (cashTagName === cashTag.replace("$", "")) {
              correctAccount = account;
              break;
            }
          }
          return correctAccount;
        })
    ,
  },

  Mutation: {
    syncTransactions: (_, args, { models }) => models.Transaction.syncTransactions(args),
    cancelSavedPayment: async (_, { entityId, /* id, */gateway }, { models }) => {
      const nmi = await models.Transaction.loadGatewayDetails(gateway);
      return models.SavedPayment.removeFromEntityId(entityId, nmi);
    },
    createOrder: (_, { instant, id, data }, { models, person, ip, req }) => {
      const requestUrl = req.headers.referer;
      const origin = req.headers.origin;
      const parsedData = JSON.parse(data);
      return models.Transaction.createOrder({
        data: parsedData,
        instant,
        id,
        ip,
        requestUrl,
        origin,
      }, person);
    },
    validate: async (_, { token, gateway }, { models }) => {
      if (!token) return null;
      const nmi = await models.Transaction.loadGatewayDetails(gateway);
      return models.SavedPayment.validate({ token }, nmi)
        .catch(e => ({ error: e.message, code: e.code, success: false }));
    },
    completeOrder: (_, { token, accountName, scheduleId }, { models, person, req }) => {
      if (!token) return null;
      const origin = req.headers.origin;
      return models.Transaction.completeOrder({ token, accountName, person, origin, scheduleId })
        .catch(e => ({ error: e.message, code: e.code, success: false }));
    },
    savePayment: async (_, { token, gateway, accountName }, { models, person }) => {
      const nmi = await models.Transaction.loadGatewayDetails(gateway);
      return models.SavedPayment.save({ token, name: accountName, person }, nmi);
    },
    cancelSchedule: async (_, { entityId, gateway }, { models }) => {
      // XXX only let the owner cancel the schedule
      const nmi = await models.Transaction.loadGatewayDetails(gateway);
      return models.ScheduledTransaction.cancelNMISchedule(entityId, nmi)
        .catch(error => ({ error: error.message, code: error.code, success: false }));
    },
  },

  ValidateMutationResponse: {
    ...MutationReponseResolver,
  },

  SavePaymentMutationResponse: {
    ...MutationReponseResolver,
    savedPayment: ({ savedPaymentId }, _, { models }) => {
      if (!savedPaymentId) return null;
      return models.SavedPayment.getFromId(savedPaymentId)
        .then(([x]) => x);
    },
  },

  CompleteOrderMutationResponse: {
    ...MutationReponseResolver,
    transaction: ({ transactionId }, _, { models }) => {
      if (!transactionId) return null;
      return models.Transaction.getFromId(transactionId);
    },
    schedule: ({ scheduleId }, _, { models }) => {
      if (!scheduleId) return null;
      return models.ScheduledTransaction.getFromId(scheduleId);
    },
    person: ({ personId }, _, { models, person }) => {
      if (person) return person;
      if (!personId) return null;
      return models.Person.getFromId(personId);
    },
    savedPayment: ({ savedPaymentId }, _, { models }) => {
      if (!savedPaymentId) return null;
      return models.SavedPayment.getFromId(savedPaymentId);
    },
  },

  OrderMutationResponse: {
    ...MutationReponseResolver,
    url: ({ url }) => url,
    transactionId: ({ transactionId }) => transactionId,
  },

  ScheduledTransactionMutationResponse: {
    ...MutationReponseResolver,
    schedule: ({ scheduleId }, _, { models }) => {
      if (!scheduleId) return null;
      return models.ScheduledTransaction.getFromId(scheduleId);
    },
  },

  TransactionDetail: {
    id: ({ Id }, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    amount: ({ Amount }) => Amount,
    account: ({ AccountId, Account }, _, { models }) => {
      if (Account) return Account;

      return models.FinancialAccount.getFromId(AccountId);
    },
  },

  ScheduledTransaction: {
    id: ({ Id }, _, $, { parentType }) => createGlobalId(Id, parentType.name),
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
    transactions: ({ Id }, _, { models }) =>
       models.ScheduledTransaction.getTransactionsById(Id)
    ,
  },

  Transaction: {
    id: ({ Id }, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    entityId: ({ Id }) => Id,
    summary: ({ Summary }) => Summary,
    status: ({ Status }) => Status,
    statusMessage: ({ StatusMessage }) => StatusMessage,
    date: ({ TransactionDateTime, CreatedDate, ModifiedDate }) => (TransactionDateTime || ModifiedDate || CreatedDate),
    details: ({ Id, TransactionDetails }, _, { models }) => {
      if (TransactionDetails) return TransactionDetails;

      return models.Transaction.getDetailsById(Id);
    },
    payment: ({ FinancialPaymentDetailId, FinancialPaymentDetail }, _, { models }) => {
      if (FinancialPaymentDetail) return FinancialPaymentDetail;

      return models.Transaction.getPaymentDetailsById(FinancialPaymentDetailId);
    },
    person: ({ AuthorizedPersonAliasId }, _, { models }) =>
      models.Person.getFromAliasId(AuthorizedPersonAliasId),
    schedule: ({ FinancialScheduleId }, $, { models }) => {
      if (!FinancialScheduleId) return null;

      return models.ScheduledTransaction.getFromId(FinancialScheduleId);
    },
  },

  FinancialAccount: {
    id: ({ Id }, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    entityId: ({ Id }) => Id,
    name: ({ PublicName }) => PublicName,
    order: ({ Order }) => Order,
    description: ({ PublicDescription }) => PublicDescription,
    summary: ({ Description }) => Description,
    image: ({ Url, ImageBinaryFieldId }, _, { models }) => {
      if (Url) return Url;


      // XXX
      // return models.BinaryFiles.getFromFieldId(ImageBinaryFieldId);
    },
    end: ({ EndDate }) => EndDate,
    start: ({ StartDate }) => StartDate,
    transactions: ({ Id, ParentAccountId }, { limit, skip, cache, start, end, people = [] }, { models, person }) => { // eslint-disable-line
      let include = people;
      if (!person) return null;
      if (person && person.aliases && !people.length) include = person.aliases;
      return models.Transaction.findByAccountType(
        {
          id: Id,
          include,
          start,
          end,
          parentId: ParentAccountId,
        }, { limit, offset: skip }, { cache },
      );
    },
    total: ({ Id, ParentAccountId }, { limit, skip, cache, start, end, people = [] }, { models, person }) => { // eslint-disable-line
      let include = people;
      if (!person) return null;
      if (person && person.aliases && !people.length) include = person.aliases;

      return models.Transaction.findByAccountType(
        {
          id: Id,
          include,
          start,
          end,
          parentId: ParentAccountId,
        }, { limit, offset: skip }, { cache },
      ).then((transactions) => {
        if (!transactions) return null;

        return transactions.map(x => x.FinancialTransactionDetails)
          .map(flatten)
          .map(x => x[0].Amount)
          .reduce((x, y) => x + y, 0);
      });
    },
    images: ({ Id }, _, { models }) => {
      const field_id = "field_id_1513"; // eslint-disable-line
      const channel_id = "69"; // eslint-disable-line
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
    id: ({ Id }, _, $, { parentType }) => createGlobalId(Id, parentType.name),
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
    id: ({ Id }, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    entityId: ({ Id }) => Id,
    name: ({ Name }) => Name,
    guid: ({ Guid }) => Guid,
    code: ({ ReferenceNumber }) => ReferenceNumber,
    date: ({ CreatedDate, ModifiedDate }) => (ModifiedDate || CreatedDate),
    payment: ({ FinancialPaymentDetailId, FinancialPaymentDetail }, _, { models }) => {
      if (FinancialPaymentDetail) return FinancialPaymentDetail;

      return models.Transaction.getPaymentDetailsById(FinancialPaymentDetailId);
    },
    expirationMonth: ({ ExpirationMonthEncrypted }) => ExpirationMonthEncrypted,
    expirationYear: ({ ExpirationYearEncrypted }) => ExpirationYearEncrypted,
  },

};
