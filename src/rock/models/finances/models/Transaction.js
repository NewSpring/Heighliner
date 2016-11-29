
import uuid from "node-uuid";
import Moment from "moment";
import { assign, isArray } from "lodash";
import QueryString from "querystring";
import fetch from "isomorphic-fetch";
import { parseString } from "xml2js";

import { createGlobalId } from "../../../../util";

import translateFromNMI from "../util/translate-nmi";
import formatTransaction from "../util/formatTransaction";
import nmi from "../util/nmi";
import submitTransaction from "../util/submit-transaction";

import {
  Transaction as TransactionTable,
  SavedPayment,
  TransactionDetail,
  ScheduledTransaction,
  ScheduledTransactionDetail,
  FinancialGateway,
  FinancialPaymentDetail as FinancialPaymentDetailTable,
  FinancialAccount,
} from "../tables";

import {
  AttributeValue,
  Attribute,
  DefinedValue,
} from "../../system/tables";

import {
  Person as PersonTable,
  PersonAlias,
} from "../../people/tables";

import {
  Campus as CampusTable,
} from "../../campuses/tables";

import {
  Group,
  GroupMember,
} from "../../groups/tables";

import { Rock } from "../../system";

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

export default class Transaction extends Rock {
  __type = "Transaction";

  async getFromId(id, globalId) {
    globalId = globalId ? globalId : createGlobalId(id, this.__type);
    return this.cache.get(globalId, () => TransactionTable.findOne({ where: { Id: id }}));
  }

  async getDetailsById(id) {
    // XXX this isn't an accurate global cache
    const globalId = createGlobalId(`${id}`, "FinancialTransactionDetail");
    return this.cache.get(globalId, () => TransactionDetail.find({ where: { TransactionId: id } }));
  }

  async getPaymentDetailsById(id) {
    if (!id) return Promise.resolve(null);

    const globalId = createGlobalId(`${id}`, "PaymentDetail");
    return this.cache.get(globalId, () => FinancialPaymentDetailTable.findOne({
        where: { Id: id },
      })
    );
  }

  async findByPersonAlias(aliases, { limit, offset }, { cache }) {
    const query = { aliases, limit, offset };
    return this.cache.get(this.cache.encode(query), () => TransactionTable.find({
        where: { AuthorizedPersonAliasId: { $in: aliases }},
        order: [
          ["TransactionDateTime", "DESC"],
        ],
        attributes: ["Id"],
        limit,
        offset,
      })
    , { cache })
      .then(this.getFromIds.bind(this));

  }

  async findByGivingGroup({ id, include, start, end } , { limit, offset }, { cache }) {
    let query = { id, include, start, end };

    let TransactionDateTime;
    if (start || end) TransactionDateTime = {};
    if (start) TransactionDateTime.$gt = Moment(start, "MM/YY");
    if (end) TransactionDateTime.$lt = Moment(end, "MM/YY");

    return this.cache.get(
      this.cache.encode(query, `findByGivingGroup`), () => TransactionTable.find({
        attributes: ["Id"],
        order: [ ["TransactionDateTime", "DESC"] ],
        where: TransactionDateTime ? [ { TransactionDateTime } ] : null,
        include: [
          {
            model: PersonAlias.model,
            attributes: [],
            include: [
              {
                model: PersonTable.model,
                attributes: [],
                where: include && include.length ? { Id: { $in: include } } : null,
                include: [
                  {
                    model: GroupMember.model,
                    attributes: [],
                    include: [
                      { model: Group.model, attributes: [], where: { Id: Number(id) } },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      })
    , { cache })
      .then((x) => x.slice(offset, limit + offset))
      .then(this.getFromIds.bind(this))
      ;
  }

  async loadGatewayDetails(gateway) {
    if (this.gateway) return this.gateway;
    if (!gateway) throw new Error("No gateway specified");

    let gateways = await FinancialGateway.find();
    gateways = gateways.filter(x => x.Name === gateway);

    if (!gateways.length) throw new Error(`No gateway found for ${gateway}`);
    gateways = gateways[0];
    const attributes = await AttributeValue.find({
      where: { EntityId: gateways.Id },
      include: [
        {
          model: Attribute.model,
          where: {
            key: {
              $in: [
                "AdminUsername",
                "AdminPassword",
                "APIUrl",
                "QueryUrl",
                "SecurityKey",
              ],
            },
          },
        },
      ],
    })
      .then(x => x.map(y => ({ value: y.Value, key: y.Attribute.Key })))
      .then(x => x.reduce((y, z, index) => {
        if (index === 1) return { [y.key]: y.value, [z.key]: z.value };
        return assign(y, { [z.key]: z.value });
      }))
      ;

    this.gateway = assign(
      gateways,
      attributes,
      // { SecurityKey: "2F822Rw39fx762MaV7Yy86jXGTC7sCDy" }
    );
    return this.gateway;
  }

  async syncTransactions(args) {

    const gateway = await this.loadGatewayDetails(args.gateway);
    delete args.gateway;
    const PersonId = args.personId;
    if (args.personId) delete args.personId;

    const querystring = QueryString.stringify(assign({
      username: gateway.AdminUsername,
      password: gateway.AdminPassword,
    }, args));

    const url = `${gateway.QueryUrl}?${querystring}`;
    const transactions = await fetch(url, { method: "POST" })
      .then(x => x.text())
      .then(x => new Promise((a, f) => {
        parseString(x, { trim: true, explicitArray: false, mergeAttrs: true }, (err, result) => {
          if (err) f(err);
          if (!err) a(result);
        });
      }))
      .then(x => x && (x).nm_response && (x).nm_response.transaction)
      .then(x => isArray(x) ? x : [x])
      .then(x => x && x.map(y => translateFromNMI(y, gateway, PersonId)))
      ;

    return Promise.all(transactions.map(submitTransaction))
      .then(y => y.filter(x => !!x))
      .then(this.getFromIds.bind(this))
      ;
  }

  createOrder = async ({ data, instant, id, ip, requestUrl, origin }, person) => {
    if (!data) return Promise.reject(new Error("No data provided"));

    const gateway = await this.loadGatewayDetails("NMI Gateway");
    const orderData = data;

    let method = "sale";

    orderData["redirect-url"] = `${requestUrl}`;
    if (orderData.amount === 0) method = "validate";
    // omitted orderData
    if (typeof orderData.amount === "undefined") method = "add-customer";
    if (orderData["start-date"]) method = "add-subscription";


    if (method !== "add-subscription" && person && person.PrimaryAliasId) {
      orderData["customer-id"] = person.PrimaryAliasId;
    }

    // XXX we should probably error out if they expect a saved account but we don't find one?
    if (orderData.savedAccount) {
      // XXX lookup only based on logged in status
      const accountDetails = await SavedPayment.findOne({ where: { Id: orderData.savedAccount }});

      delete orderData.savedAccount;
      delete orderData.savedAccountName;
      if (accountDetails && accountDetails.ReferenceNumber) {
        delete orderData["customer-id"];
        orderData["customer-vault-id"] = accountDetails.ReferenceNumber;
      }
    }

    if (method !== "add-subscription" && method !== "add-customer") {
      // add in IP address
      orderData["ip-address"] = ip;

      // strongly force CVV on acctions that aren't a saved account
      if (!orderData["customer-vault-id"]) orderData["cvv-reject"] = "P|N|S|U";
    }

    if (!orderData["customer-vault-id"] && method === "sale") orderData["add-customer"] = "";
    if (orderData["customer-vault-id"] && method === "add-subscription") {
      delete orderData["redirect-url"];
    }

    const generatedId = `apollos_${Date.now()}_${Math.ceil(Math.random() * 100000)}`;
    if (method !== "add-customer") {
      orderData["order-description"] = "Online contribution from Apollos",
      orderData["order-id"] =  generatedId || orderData.orderId;
    }

    const order = {
      [method]: {
        ...{ "api-key": gateway.SecurityKey },
        ...orderData,
      },
    };

    return nmi(order, gateway)
      .then((data) => {
        if (!instant) return data;
        // XXX create a schedule from the transaction
        const scheduleId = id;
        return Promise.resolve(data)
          .then(response => formatTransaction({ scheduleId, response, person, origin }, gateway))
          .then(this.getOrCreatePerson)
          .then(this.createPaymentDetail)
          .then(this.findOrCreateTransaction)
          .then(this.findOrCreateSchedule)
          .then(this.createTransactionDetails)
          .then(this.createSavedPayment)
      })
      .then(data => ({
        success: data.result === 1,
        code: data["result-code"],
        url: data["form-url"],
        transactionId: data["transaction-id"],
      }))
      .catch(e => ({ error: e.message, code: e.code }));

  }

  charge = async (token, gatewayDetails) => {

    const complete = {
      "complete-action": {
        "api-key": gatewayDetails.SecurityKey,
        "token-id": token,
      },
    };

    return nmi(complete, gatewayDetails);
  }

  getOrCreatePerson = async (data) => {
    const { Person } = data;
    if (Person.Id) return data;

    const Id = await PersonTable.post(Person)
    const Entities = data;
    Entities.Person = await PersonTable.findOne({
      where: { Id },
      include: [{ model: PersonAlias.model }]
    }).then(x => {
      x.PrimaryAliasId = x.PersonAlias.Id
      return x;
    });

    return Entities;
  }

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
      Person,
      SourceTypeValue,
      Transaction,
    } = data;
    if (!Transaction.TransactionCode) return data;
    if (Transaction.Id) return data;

    // create a transaction if it doesn't exist
    const Existing = await TransactionTable.find({
      where: { TransactionCode: Transaction.TransactionCode }
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
      // XXX BatchId
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
      where: { GatewayScheduleId: Schedule.GatewayScheduleId }
    });

    let TransactionId;
    if (Existing.length) {
      Schedule.Id = Existing[0].Id;
    } else {

      if (Schedule.TransactionFrequencyValue) {
        await DefinedValue.find({
          where: { DefinedTypeId: 23 },
        })
          .then(x => readIdsFromFrequencies(Schedule.TransactionFrequencyValue, x))
          .then(id => {
            Schedule.TransactionFrequencyValueId = id;
            delete Schedule.TransactionFrequencyValue;
          })
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
      Schedule.Id = await ScheduledTransaction.post(Schedule)

      return data;
    }
  }

  createTransactionDetails = async (data) => {
    const {
      FinancialPaymentDetail,
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
        }
      })
        .then(x => x && x.Id || null)

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
          }
        })
          .then(x => x && x.Id || null);
      }

      const detail = assign(x, {
        CreatedByPersonAliasId: Person.PrimaryAliasId,
        ModifiedByPersonAliasId: Person.PrimaryAliasId,
        AccountId,
      });

      if (Schedule.Id && !Transaction.Id) {
        detail.ScheduledTransactionId = Schedule.Id
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

  async completeOrder({ scheduleId, token, person, accountName, origin }) {
    const gatewayDetails = await this.loadGatewayDetails("NMI Gateway");

    return this.charge(token, gatewayDetails)
      .then(response => formatTransaction({
        scheduleId, response, person, accountName, origin
      }, gatewayDetails))
      .then(this.getOrCreatePerson)
      .then(this.createPaymentDetail)
      .then(this.findOrCreateTransaction)
      .then(this.findOrCreateSchedule)
      .then(this.createTransactionDetails)
      .then(this.createSavedPayment)
      // .then(this.sendEmail)
      // XXX update location better
      // .then(x => {
      //   const Entities = x;
      // })
      .then(this.debug)
      .catch(e =>  {
        console.log(e);
        return { error: e.message, code: e.code, success: false };
      });

  }
}
