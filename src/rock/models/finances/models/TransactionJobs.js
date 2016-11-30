/* eslint-disable no-param-reassign */
import uuid from "node-uuid";
import { assign } from "lodash";
import queue from "bull";

import {
  Transaction as TransactionTable,
  SavedPayment,
  TransactionDetail,
  ScheduledTransaction,
  ScheduledTransactionDetail,
  FinancialPaymentDetail as FinancialPaymentDetailTable,
  FinancialAccount,
} from "../tables";

import FinancialBatch from "./FinancialBatch";

import {
  DefinedValue,
} from "../../system/tables";

import {
  Person as PersonTable,
  PersonAlias,
} from "../../people/tables";

import {
  Campus as CampusTable,
  Location as LocationTable,
} from "../../campuses/tables";

import {
  Group,
  GroupLocation,
  GroupMember,
} from "../../groups/tables";

import { Rock } from "../../system";

// XXX move to util
export const readIdsFromFrequencies = (plan, frequencies) => {
  const ids = {};
  for (const f of frequencies) ids[f.Value] = f;
  if (plan["day-frequency"]) {
    switch (plan["day-frequency"]) { // eslint-disable-line
      case "7":
        return ids.Weekly.Id; // Every Week (Rock)
      case "14":
        return ids["Bi-Weekly"].Id; // Every Two Weeks (Rock)
    }
  }

  if (plan["month-frequency"]) {
    switch (plan["month-frequency"]) { // eslint-disable-line
      case "2":
        return ids["Twice a Month"].Id; // Twice A Month (Rock)
      case "1":
        return ids.Monthly.Id; // Once A Month (Rock)
    }
  }

  if (plan["day-of-month"]) {
    return ids["One-Time"].Id; // One Time (Rock)
  }
};

const TRANSACTION_QUEUE = queue("Transaction Receipt", 6379, process.env.REDIS_HOST);

export default class TransactionJobs extends Rock {
  constructor({ cache }) {
    super({ cache });
    this.FinancialBatch = new FinancialBatch({ cache });

    TRANSACTION_QUEUE.process(({ data }) => {
      return Promise.resolve(data)
        .then(this.getOrCreatePerson)
        .then(this.createPaymentDetail)
        .then(this.findOrCreateTransaction)
        .then(this.findOrCreateSchedule)
        .then(this.createTransactionDetails)
        .then(this.createSavedPayment)
        .then(this.updateBillingAddress)
        .then(this.sendGivingEmail);
    });
  }

  add = (data) => {
    // will retry every 5 minutes for one day
    TRANSACTION_QUEUE.add(data, {
      removeOnComplete: true,
      attempts: 288,
      backoff: { type: "fixed", delay: 60000 * 5 },
    });
  }

  getOrCreatePerson = async (data) => {
    const { Person } = data;
    if (Person.Id) return data;

    const Id = await PersonTable.post(Person);
    const Entities = data;
    Entities.Person = await PersonTable.findOne({
      where: { Id },
      include: [{ model: PersonAlias.model }],
    }).then((x) => {
      x.PrimaryAliasId = x.PersonAlias.Id;
      return x;
    });

    return Entities;
  }

  updateBillingAddress = async (data) => {
    const {
      Person,
      Location,
      GroupId,
      GroupLocationId,
    } = data;

    if (Location.Id) return data;

    const alreadyOnFileLocations = await GroupLocation.find({
      include: [
        {
          model: LocationTable.model,
          where: { Street1: { $like: Location.Street1 } },
        },
        {
          model: Group.model,
          attributes: [],
          where: { GroupTypeId: 10 }, // Family
          include: [
            { model: GroupMember.model, where: { PersonId: `${Person.Id}` }, attributes: [] },
          ],
        },
      ],
    });

    if (alreadyOnFileLocations.length) {
      Location.Id = alreadyOnFileLocations[0].Id;
      return data;
    }

    Location.Guid = uuid.v4();
    Location.Id = await LocationTable.post(Location);
    let NewGroupId;
    if (!GroupId) {
      NewGroupId = await Group.findOne({
        where: { GroupTypeId: 10 }, // Family
        include: [
          { model: GroupMember.model, where: { PersonId: `${Person.Id}` }, attributes: [] },
        ],
      })
        .then(x => x && x.Id);
      data.GroupId = NewGroupId;
    }

    const NewGroupLocation = {
      GroupId: NewGroupId,
      Order: 0,
      LocationId: Location.Id,
      // XXX ensure this is present on rock (it is on NewSpring's). Should be system
      GroupLocationTypeValueId: 804, // BillingAddress
      IsMailingLocation: true,
      Guid: uuid.v4(),
    };

    if (!GroupLocationId) {
      const NewGroupLocationId = await GroupLocation.post(NewGroupLocation);
      data.GroupLocationId = NewGroupLocationId;
    }

    return data;
  };

  createPaymentDetail = async (data) => {
    const { FinancialPaymentDetail } = data;
    if (FinancialPaymentDetail.Id) return data;

    // create a payment detail
    FinancialPaymentDetail.Id = await FinancialPaymentDetailTable
      .post(FinancialPaymentDetail);

    return data;
  }

  findOrCreateTransaction = async (data) => {
    const {
      FinancialPaymentDetail,
      FinancialPaymentValue,
      Person,
      SourceTypeValue,
      Transaction,
    } = data;
    if (!Transaction.TransactionCode) return data;
    if (Transaction.Id) return data;

    // create a transaction if it doesn't exist
    const Existing = await TransactionTable.find({
      where: { TransactionCode: Transaction.TransactionCode },
    });

    let TransactionId;
    if (Existing.length) {
      Transaction.Id = Existing[0].Id;
    } else {
      if (!Transaction.SourceTypeValueId && SourceTypeValue.Url) {
        Transaction.SourceTypeValueId = await DefinedValue.findOne({
          where: { Value: SourceTypeValue.Url, DefinedTypeId: 12 },
        })
          .then(x => x && x.Id || 10);
      }

      Transaction.AuthorizedPersonAliasId = Person.PrimaryAliasId;
      Transaction.CreatedByPersonAliasId = Person.PrimaryAliasId;
      Transaction.ModifiedByPersonAliasId = Person.PrimaryAliasId;
      const Batch = await this.FinancialBatch.findOrCreate({
        currencyType: FinancialPaymentValue,
        date: Transaction.TransactionDateTime,
      });
      if (Batch && Batch.Id) Transaction.BatchId = Batch.Id;
      Transaction.FinancialPaymentDetailId = FinancialPaymentDetail.Id;

      Transaction.Id = await TransactionTable.post(Transaction);

      return data;
    }
  }

  findOrCreateSchedule = async (data) => {
    const {
      FinancialPaymentDetail,
      Person,
      Schedule,
      SourceTypeValue,
    } = data;
    // not a schedule transaction
    if (!Schedule.GatewayScheduleId) return data;

    // if (Schedule.Id && )
    const Existing = await ScheduledTransaction.find({
      where: { GatewayScheduleId: Schedule.GatewayScheduleId },
    });

    if (Existing.length) {
      Schedule.Id = Existing[0].Id;
    } else {
      if (Schedule.TransactionFrequencyValue) {
        await DefinedValue.find({
          where: { DefinedTypeId: 23 },
        })
          .then(x => readIdsFromFrequencies(Schedule.TransactionFrequencyValue, x))
          .then((id) => {
            Schedule.TransactionFrequencyValueId = id;
            delete Schedule.TransactionFrequencyValue;
          });
      }

      if (!Schedule.SourceTypeValueId && SourceTypeValue.Url) {
        Schedule.SourceTypeValueId = await DefinedValue.findOne({
          where: { Value: SourceTypeValue.Url, DefinedTypeId: 12 },
        })
          .then(x => x && x.Id || 10);
      }

      Schedule.AuthorizedPersonAliasId = Person.PrimaryAliasId;
      Schedule.CreatedByPersonAliasId = Person.PrimaryAliasId;
      Schedule.ModifiedByPersonAliasId = Person.PrimaryAliasId;
      // XXX BatchId
      Schedule.FinancialPaymentDetailId = FinancialPaymentDetail.Id;
      Schedule.Id = await ScheduledTransaction.post(Schedule);

      return data;
    }
  }

  createTransactionDetails = async (data) => {
    const {
      Transaction,
      Schedule,
      Person,
      TransactionDetails,
      Campus,
    } = data;

    // create transaction details
    data.TransactionDetails = await Promise.all(TransactionDetails.map(async (x) => {
      if (x.Id) return x;

      let AccountId = await FinancialAccount.findOne({
        where: {
          CampusId: Campus.Id,
          ParentAccountId: x.AccountId,
        },
      })
        .then(x => x && x.Id || null);

      if (!AccountId) {
        // if no account is found, use the person's campus for the account
        const FamilyCampus = await Group.findOne({
          where: { GroupTypeId: 10 }, // family
          include: [
            { model: GroupMember.model, where: { PersonId: `${Person.Id}` } },
            { model: CampusTable.model },
          ],
        })
          .then(x => x && x.Campus || {});

        AccountId = await FinancialAccount.findOne({
          where: {
            CampusId: FamilyCampus.Id,
            ParentAccountId: x.AccountId,
          },
        })
          .then(x => x && x.Id || null);
      }

      const detail = assign(x, {
        CreatedByPersonAliasId: Person.PrimaryAliasId,
        ModifiedByPersonAliasId: Person.PrimaryAliasId,
        AccountId,
      });

      if (Schedule.Id && !Transaction.Id) {
        detail.ScheduledTransactionId = Schedule.Id;
        x.Id = await ScheduledTransactionDetail.post(detail);
      } else {
        detail.TransactionId = Transaction.Id;
        x.Id = await TransactionDetail.post(detail);
      }


      return x;
    }));

    return data;
  }

  createSavedPayment = async (data) => {
    const {
      FinancialPaymentDetail,
      Person,
      FinancialPersonSavedAccount,
    } = data;

    if (
      FinancialPersonSavedAccount.Id ||
      !FinancialPersonSavedAccount.Name ||
      !FinancialPersonSavedAccount.ReferenceNumber
    ) return data;

    delete FinancialPaymentDetail.Id;
    FinancialPaymentDetail.Guid = uuid.v4();

    data = await this.createPaymentDetail(data);

    FinancialPersonSavedAccount.Id = SavedPayment.post(assign(FinancialPersonSavedAccount, {
      PersonAliasId: Person.PrimaryAliasId,
      FinancialPaymentDetailId: FinancialPaymentDetail.Id,
      CreatedByPersonAliasId: Person.PrimaryAliasId,
      ModifiedByPersonAliasId: Person.PrimaryAliasId,
    }));

    return data;
  }

  sendGivingEmail = async (data) => {
    if (data.CommunicationSent) return data;

    const {
      Person,
      TransactionDetails,
      Transaction,
      FinancialPaymentDetail,
      Schedule,
    } = data;

    // don't send email on schedules right now
    if (Schedule.GatewayScheduleId) return data;

    // formatting to match https://github.com/SparkDevNetwork/Rock/blob/develop/Rock/Transactions/SendPaymentReceipts.cs
    let totalAmount = 0;
    const accountAmounts = [];
    for (const detail of TransactionDetails) {
      if (detail.Amount <= 0 || !detail.AccountId) continue; // eslint-disable-line

      const accountAmount = {
        AccountId: detail.AccountId,
        AccountName: detail.AccountName,
        Amount: detail.Amount,
      };

      accountAmounts.push(accountAmount);
      totalAmount += detail.Amount;
    }

    const FoundPerson = await PersonTable.findOne({ where: { Id: Person.Id } });
    const mergeFields = {
      Person: FoundPerson,
      TotalAmount: totalAmount,
      GaveAnonymous: !!Person.FirstName,
      ReceiptEmail: FoundPerson.Email,
      ReceiptEmailed: true,
      LastName: FoundPerson.LastName,
      FirstNames: FoundPerson.NickName || FoundPerson.FirstName,
      TransactionCode: Transaction.TransactionCode,
      Amounts: accountAmounts,
      AccountNumberMasked: FinancialPaymentDetail.AccountNumberMasked.slice(-4),
    };

    await this.sendEmail("Giving Receipt", [Person.PrimaryAliasId], mergeFields);

    data.CommunicationSent = true;
    return data;
  }

}
