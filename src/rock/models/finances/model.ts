import { merge, isUndefined } from "lodash";
import Moment from "moment";
import { assign, isArray } from "lodash";
import QueryString from "querystring";
import fetch from "isomorphic-fetch";
import { parseString } from "xml2js";

import { createGlobalId } from "../../../util";

import translateFromNMI from "./util/translate-nmi";
import submitTransaction from "./util/submit-transaction";

import {
  Transaction as TransactionTable,
  // TransactionRefund,
  TransactionDetail,
  ScheduledTransaction as ScheduledTransactionTable,
  ScheduledTransactionDetail,
  SavedPayment as SavedPaymentTable,
  FinancialAccount as FinancialAccountTable,
  FinancialGateway,
  FinancialPaymentDetail,
} from "./tables";

import { AttributeValue, Attribute } from "../system/tables";

import {
  Person,
  PersonAlias,
} from "../people/tables";

import {
  Group,
  GroupMember,
} from "../groups/tables";

import { Rock } from "../system";

export interface Gateway {
  AdminUsername: string;
  AdminPassword: string;
  APIUrl: string;
  QueryUrl: string;
  SecurityKey: string;
  Id: number;
}

class FinancialModel extends Rock {

}

export class Transaction extends FinancialModel {
  public __type: string = "Transaction";

  private gateway: any;

  public async getFromId(id: string, globalId: string): Promise<any> { // XXX correctly type
    globalId = globalId ? globalId : createGlobalId(id, this.__type);
    return this.cache.get(globalId, () => TransactionTable.findOne({ where: { Id: id }}));
  }

  public async getDetailsById(id: string | number): Promise<any> {
    // XXX this isn't an accurate global cache
    const globalId = createGlobalId(`${id}`, "FinancialTransactionDetail");
    return this.cache.get(globalId, () => TransactionDetail.find({ where: { TransactionId: id } }));
  }

  public async getPaymentDetailsById(id: string | number): Promise<any> {
    if (!id) return Promise.resolve(null);

    const globalId = createGlobalId(`${id}`, "PaymentDetail");
    return this.cache.get(globalId, () => FinancialPaymentDetail.findOne({
        where: { Id: id },
      })
    );
  }

  public async findByPersonAlias(
    aliases: string | number,
    { limit, offset }, { cache }
  ): Promise<any> {
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

  public async findByGivingGroup(
    {id, include, start, end } , { limit, offset }, { cache }
  ): Promise<any> {
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
      .then((x: any[]) => x.slice(offset, limit + offset))
      .then(this.getFromIds.bind(this))
      ;
  }

  private async loadGatewayDetails(gateway): Promise<Gateway> {
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

  public async syncTransactions(args): Promise<any> {

    const gateway = await this.loadGatewayDetails(args.gateway) as any;
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
      .then(this.debug)
      .then(x => x && (x as any).nm_response && (x as any).nm_response.transaction)
      .then(x => isArray(x) ? x : [x])
      .then(x => x && x.map(y => translateFromNMI(y, gateway, PersonId)))
      ;

    return Promise.all(transactions.map(submitTransaction))
      .then(y => y.filter(x => !!x))
      .then(this.getFromIds.bind(this))
      ;
  }
}

export class ScheduledTransaction extends FinancialModel {
  public __type: string = "ScheduledTransaction";

  public async getFromId(id: string, globalId: string): Promise<any> { // XXX correctly type
    globalId = globalId ? globalId : createGlobalId(`${id}`, this.__type);
    return this.cache.get(globalId, () => ScheduledTransactionTable.findOne({ where: { Id: id }}));
  }

  public async getTransactionsById(id: string | number): Promise<any> {
    if (!id) return Promise.resolve(null);
    const globalId = createGlobalId(`${id}`, "ScheduledTransactionTransactions");
    return this.cache.get(globalId, () => TransactionTable.find({
        where: { ScheduledTransactionId: id },
        order: [ ["TransactionDateTime", "DESC"] ],
      })
    );
  }

  public async getDetailsByScheduleId(id: string | number): Promise<any> {
    if (!id) return Promise.resolve(null);
    const globalId = createGlobalId(`${id}`, "ScheduledTransactionDetails");
    // XXX why isn't this caching?
    return this.cache.get(globalId, () => ScheduledTransactionDetail.find({
        where: { ScheduledTransactionId: id },
      })
    );
  }

  public async findByPersonAlias(
    aliases: string | number,
    { limit, offset, isActive }, { cache }
  ): Promise<any> {
    const query = { aliases, limit, offset, isActive };
    return await this.cache.get(this.cache.encode(query), () => ScheduledTransactionTable.find({
        where: { AuthorizedPersonAliasId: { $in: aliases }, IsActive: isActive },
        order: [
          ["CreatedDateTime", "DESC"],
        ],
        attributes: ["Id"],
        limit,
        offset,
      })
    , { cache })
      .then(this.getFromIds.bind(this))
      ;

  }
}

export class SavedPayment extends FinancialModel {
  public __type: string = "SavedPayment";

  public async getFromId(id: string, globalId: string): Promise<any> { // XXX correctly type
    globalId = globalId ? globalId : createGlobalId(id, this.__type);
    return this.cache.get(globalId, () => SavedPaymentTable.find({ where: { Id: id }}));
  }

  public async findByPersonAlias(
    aliases: string | number,
    { limit, offset }, { cache }
  ): Promise<any> {
    const query = { aliases, limit, offset };
    return await this.cache.get(this.cache.encode(query), () => SavedPaymentTable.find({
        where: { PersonAliasId: { $in: aliases }},
        order: [
          ["ModifiedDateTime", "ASC"],
        ],
        attributes: ["Id"],
        limit,
        offset,
      })
    , { cache })
      .then(this.getFromIds.bind(this));

  }
}

export class FinancialAccount extends FinancialModel {
  public __type: string = "FinancialAccount";

  public async getFromId(id: string, globalId: string): Promise<any> { // XXX correctly type
    globalId = globalId ? globalId : createGlobalId(id, this.__type);
    return this.cache.get(
      globalId,
      () => FinancialAccountTable.findOne({ where: { Id: id }})
        .then(x => {
          // if this is a children fund, lets get the parent
          if (!x.ParentAccountId) return x;

          return FinancialAccountTable.findOne({ where: { Id: x.ParentAccountId }});
        })
    );
  }

  public async find(where: any): Promise<any> {

    for (let key in where) {
      if (isUndefined(where[key])) delete where[key];
    }
    // defaults
    where = merge({
      ParentAccountId: null,
      PublicDescription: {
        $and: {
          $ne: "",
          $not: null,
        },
      },
      IsTaxDeductible: true,
    }, where);
    return await this.cache.get(
      this.cache.encode(where),
      () => FinancialAccountTable.find({ where, attributes: ["Id"], order: ["Order"] })
        .then(this.getFromIds.bind(this))
    );
  }

}

export default {
  Transaction,
  ScheduledTransaction,
  SavedPayment,
  FinancialAccount,
};
