
import Moment from "moment";
import { assign, isArray } from "lodash";
import QueryString from "querystring";
import fetch from "isomorphic-fetch";
import { parseString } from "xml2js";

import { createGlobalId } from "../../../../util";
import { createCache } from "../../../../util/cache";


import translateFromNMI from "../util/translate-nmi";
import formatTransaction from "../util/formatTransaction";
import nmi from "../util/nmi";
import submitTransaction from "../util/submit-transaction";

import {
  Transaction as TransactionTable,
  SavedPayment,
  TransactionDetail,
  FinancialGateway,
  FinancialAccount,
  FinancialPaymentDetail as FinancialPaymentDetailTable,
} from "../tables";


import {
  AttributeValue,
  Attribute,
} from "../../system/tables";

import {
  Person as PersonTable,
  PersonAlias,
} from "../../people/tables";

import {
  Group,
  GroupMember,
} from "../../groups/tables";

import { Rock } from "../../system";

import TransactionJobs from "./TransactionJobs";

let TransactionJob = {};
createCache().then((cache) => {
  TransactionJob = new TransactionJobs({ cache });
});

export default class Transaction extends Rock {
  __type = "Transaction";
  // makes it easier to test
  TransactionJob = TransactionJob;

  async getFromId(id, globalId) {
    globalId = globalId ? globalId : createGlobalId(id, this.__type);
    return this.cache.get(globalId, () => TransactionTable.findOne({ where: { Id: id } }));
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
    }),
    );
  }

  async findByPersonAlias(aliases, { limit, offset }, { cache }) {
    const query = { aliases, limit, offset };
    return this.cache.get(this.cache.encode(query), () => TransactionTable.find({
      where: { AuthorizedPersonAliasId: { $in: aliases } },
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

  async findByAccountType({ personId, id, include = [], start, end }, { limit, offset }, { cache }) {
    if (!include.length) return null;

    const query = { id, include, start, end };

    let TransactionDateTime;
    if (start || end) TransactionDateTime = {};
    if (start) TransactionDateTime.$gt = Moment(start);
    if (end) TransactionDateTime.$lt = Moment(end);

    let ParentAccount = await FinancialAccount.find({
      where: { ParentAccountId: id }
    }).then(x => x.map(y => y.Id));

    const where = {
      AuthorizedPersonAliasId: {
        $in: include
      }
    };

    const includeQuery = [
      {
        model: TransactionDetail.model,
        where: { AccountId: { $in: ParentAccount }}
      },
    ];

    if (personId) {
      delete where.AuthorizedPersonAliasId;
      includeQuery.push({
        model: PersonAlias.model,
        attributes: [],
        include: [
          {
            model: PersonTable.model,
            attributes: [],
            include: [
              {
                model: GroupMember.model,
                attributes: [],
                include: [
                  { model: Group.model, attributes: [], where: { Id: personId } },
                ],
              },
            ],
          },
        ],
      });
    }

    if (start) where.TransactionDateTime = TransactionDateTime;

    return TransactionTable.find({
      order: [["TransactionDateTime", "DESC"]],
      where,
      include: includeQuery,
    }).then((x) => {
      if(limit) return x.slice(offset, limit + offset);

      return x;
    });
  }

  async findByGivingGroup({ id, include, start, end }, { limit, offset }, { cache }) {
    const query = { id, include, start, end };

    let TransactionDateTime;
    if (start || end) TransactionDateTime = {};
    if (start) TransactionDateTime.$gt = Moment(start);
    if (end) TransactionDateTime.$lt = Moment(end);

    return this.cache.get(
      this.cache.encode(query, "findByGivingGroup"), () => TransactionTable.find({
        attributes: ["Id"],
        order: [["TransactionDateTime", "DESC"]],
        where: TransactionDateTime ? [{ TransactionDateTime }] : null,
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
      .then(x => {
        if (!limit) return x;
        return x.slice(offset, limit + offset);
      })
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

  charge = async (token, gatewayDetails) => {
    const complete = {
      "complete-action": {
        "api-key": gatewayDetails.SecurityKey,
        "token-id": token,
      },
    };

    return nmi(complete, gatewayDetails);
  }

  async createOrder({ data, instant, id, ip, requestUrl, origin }, person) {
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
      const accountDetails = await SavedPayment.findOne({ where: { Id: orderData.savedAccount } });

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
      orderData["order-id"] = generatedId || orderData.orderId;
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
        const response = formatTransaction({ scheduleId, response: data, person, origin }, gateway);
        this.TransactionJob.add(response);
        return data;
      })
      .then(data => ({
        success: data.result === 1,
        code: data["result-code"],
        url: data["form-url"],
        transactionId: data["transaction-id"],
      }))
      .catch(e => ({ error: e.message, code: e.code }));
  }

  async completeOrder({ scheduleId, token, person, accountName, origin }) {
    const gatewayDetails = await this.loadGatewayDetails("NMI Gateway");

    return this.charge(token, gatewayDetails)
      .then(response => formatTransaction({
        scheduleId, response, person, accountName, origin,
      }, gatewayDetails))
      .then((data) => {
        this.TransactionJob.add(data);
        return data;
      })
      .catch(({ message, code }) =>
         ({ error: message, code, success: false }),
      );
  }
}
