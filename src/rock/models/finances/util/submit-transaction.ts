
import { find, omitBy, isEmpty, flatten } from "lodash";

import {
  Tables,
} from "./translate-nmi";

import {
  Transaction as TransactionTable,
  TransactionDetail,
  ScheduledTransaction as ScheduledTransactionTable,
  // ScheduledTransactionDetail,
  // SavedPayment as SavedPaymentTable,
  FinancialAccount as FinancialAccountTable,
  // FinancialGateway,
  FinancialPaymentDetail,
} from "../tables";

// import { AttributeValue, Attribute } from "../../system/tables";

import {
  Person as PersonTable,
  PersonAlias,
} from "../../people/tables";

import {
  Group,
  GroupLocation,
  GroupMember,
} from "../../groups/tables";

import {
  Location as LocationModel,
} from "../../campuses/tables";

export default async (transaction?: Tables): Promise<any> => {
  if (!transaction) return Promise.resolve();
  const {
    CampusId,
    Location,
    Transaction,
    TransactionDetails,
    PaymentDetail,
    Person,
    ScheduledTransaction,
  } = transaction;

  const Existing = await TransactionTable.find({ where: {
    TransactionCode: Transaction.TransactionCode,
  }});

  const exists = Existing.length > 0;
  if (exists) return Promise.resolve();

  const People = await PersonTable.find({ where: Person, include: [{ model: PersonAlias.model }] });
  if (!People.length) return Promise.resolve();

  let ids;
  if (!Person.Id) {
    const FoundLocations = await GroupLocation.find({
      include: [
        { model: LocationModel.model, where: omitBy(Location, isEmpty) },
        {
          model: Group.model,
          where: { GroupTypeId: 10 }, // Family
          include: [
            {
              model: GroupMember.model,
              where: { PersonId: { $in: [ People.map(x => x.Id) ] } },
            },
          ],
        },
      ],
    });

    if (FoundLocations.length) {
      ids = flatten(FoundLocations.map(x => x.Group.GroupMembers)).map(x => (x as any).PersonId);
    } else {
      ids = [People[0].Id];
      console.warn(`no locations found for ${People.map(x => x.FirstName)}`);
    }
  } else {
    ids = [Person.Id];
  }

  const FoundPerson = find(People, { Id: ids[0] });
  const PrimaryAliasId = (FoundPerson as any).PersonAlias.Id;

  // translate to child account based on campus
  if (CampusId) {
    for (let detail of TransactionDetails) {
      detail.AccountId = await FinancialAccountTable.findOne({ where: {
        CampusId, ParentAccountId: detail.AccountId,
      }})
        .then(x => x.Id);

      detail.CreatedByPersonAliasId = PrimaryAliasId;
    }
  }

  PaymentDetail.CreatedByPersonAliasId = PrimaryAliasId;
  Transaction.AuthorizedPersonAliasId = PrimaryAliasId;
  Transaction.CreatedByPersonAliasId = PrimaryAliasId;

  const FinancialPaymentDetailId = await FinancialPaymentDetail.post(PaymentDetail);

  Transaction.FinancialPaymentDetailId = FinancialPaymentDetailId;

  if (ScheduledTransaction.GatewayScheduleId) {
    const ScheduledTransactionId = await ScheduledTransactionTable.findOne({
      where: ScheduledTransaction,
    })
      .then(x => x && x.Id);

    if (ScheduledTransactionId) Transaction.ScheduledTransactionId = ScheduledTransactionId;
    if (!ScheduledTransactionId) {
      console.error(`
        Scheduled Transaction is missing for person ${(FoundPerson as any).Id} with
        GatewayScheduleId of ${ScheduledTransaction.GatewayScheduleId}
      `);
    }
  }
  const FinancialTransactionId = await TransactionTable.post(Transaction);

  for (let detail of TransactionDetails) {
    detail.TransactionId = FinancialTransactionId;
    TransactionDetail.post(detail);
  }

  return Promise.resolve({ Id: FinancialTransactionId });
};
