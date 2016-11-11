
import Moment from "moment";
import { assign, isArray } from "lodash";
import QueryString from "querystring";
import fetch from "isomorphic-fetch";
import { parseString } from "xml2js";

import { createGlobalId } from "../../../../util";

import translateFromNMI from "../util/translate-nmi";
import submitTransaction from "../util/submit-transaction";

import {
  Transaction as TransactionTable,
  // TransactionRefund,
  TransactionDetail,
  FinancialGateway,
  FinancialPaymentDetail,
} from "../tables";

import { AttributeValue, Attribute } from "../../system/tables";

import {
  Person,
  PersonAlias,
} from "../../people/tables";

import {
  Group,
  GroupMember,
} from "../../groups/tables";

import { Rock } from "../../system";

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
    return this.cache.get(globalId, () => FinancialPaymentDetail.findOne({
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
                model: Person.model,
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

    this.gateway = assign(gateways, attributes);
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
}
