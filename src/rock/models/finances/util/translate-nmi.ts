import uuid from "node-uuid";
import { isArray, find } from "lodash";
import Moment from "moment";

const getCardType = (card) => {
  const d = /^6$|^6[05]$|^601[1]?$|^65[0-9][0-9]?$|^6(?:011|5[0-9]{2})[0-9\*]{0,12}$/gmi;

  const defaultRegex = {
    visa: /^4[0-9\*]{0,15}$/gmi,
    masterCard: /^5$|^5[1-5][0-9\*]{0,14}$/gmi,
    amEx: /^3$|^3[47][0-9\*]{0,13}$/gmi,
    discover: d,
  };

  let definedTypeMapping = {
    visa: 7,
    masterCard: 8,
    // check: 9,
    discover: 160,
    amEx: 159,
  };

  for (let regex in defaultRegex) {
    if (defaultRegex[regex].test(card)) return definedTypeMapping[regex];
  }

  return null;

};

export interface FinancialPaymentDetail {
  AccountNumberMasked?: string;
  BillingLocationId?: number;
  CreditCardTypeValueId?: number;
  CurrencyTypeValueId?: number;
  Guid?: string;
  Id?: number;
  ForeignId?: number;
  ForeignKey?: string;
  CreatedByPersonAliasId?: number;
  ReferenceNumber?: string;
}

export interface FinancialTransactionDetails {
  TransactionId?: number;
  AccountId?: number;
  Amount?: number;
  CreatedByPersonAliasId?: number;
  Guid?: string;
  Id?: string;
  ForeignId?: number;
  ForeignKey?: string;
}

export interface Person {
  FirstName?: string;
  LastName?: string;
  Email?: string;
  Id?: number;
}

export interface Location {
  Street1: string;
  Street2: string;
  City: string;
  State: string;
  PostalCode: string;
  Country: string;
}

export interface FinancialTransaction {
  AuthorizedPersonAliasId?: number;
  BatchId?: number;
  FinancialGatewayId: number;
  FinancialPaymentDetailId?: number;
  SourceTypeValueId: number;
  Summary?: string;
  StatusMessage?: string;
  TransactionCode: string;
  TransactionDateTime: string;
  TransactionTypeValueId: number;
  CreatedByPersonAliasId?: number;
  Guid: string;
  Id?: string;
  ForeignId?: number;
  ScheduledTransactionId?: number;
  ForeignKey?: string;
}

export interface FinancialScheduledTransaction {
  GatewayScheduleId?: string;
}

export interface Tables {
  Transaction: FinancialTransaction;
  Location: Location;
  Person: Person;
  TransactionDetails: FinancialTransactionDetails[];
  PaymentDetail: FinancialPaymentDetail;
  CampusId: number;
  ScheduledTransaction?: FinancialScheduledTransaction;
}

import { Gateway } from "../models/Transaction";

export default (transaction: any, gateway: Gateway, person: number): Tables => {
  // reverse this when multiple accounts are stored in NMI correctly
  if (isArray(transaction.action)) transaction.action = transaction.action[0];
  if (transaction.condition !== "complete") return null;
  if (transaction.action.action_type !== "sale" && transaction.action.action_type !== "settle") {
    return null;
  }

  const Transaction: FinancialTransaction = {
    TransactionCode: transaction.transaction_id,
    ForeignKey: transaction.order_id,
    TransactionTypeValueId: 53,
    Guid: uuid.v4(),
    FinancialGatewayId: gateway.Id,
    Summary: `Reference Number: ${transaction.transaction_id}`,
    SourceTypeValueId: 798, // XXX make this dynamic
    TransactionDateTime: Moment(transaction.action.date, "YYYYMMDDHHmmss").toISOString(),
  };

  const TransactionDetails: FinancialTransactionDetails[] = [];
  if (transaction.product) {
    if (!isArray(transaction.product)) transaction.product = [transaction.product];
    for (let product of transaction.product) {
      TransactionDetails.push({
         // XXX support multiple transactions
        // XXX this needs a change on the app side before possible
        Amount: Number(transaction.action.amount),
        AccountId: Number(product.sku),
        Guid: uuid.v4(),
      });
    }
  } else if (transaction.action && transaction.action.source === "recurring") {
    TransactionDetails.push({
      // XXX support multiple transactions
      // XXX this needs a change on the app side before possible
      Amount: Number(transaction.action.amount),
      AccountId: Number((find(transaction.merchant_defined_field, { id: "1"}) as any)._),
      Guid: uuid.v4(),
    });
  }

  const PaymentDetail: FinancialPaymentDetail = {
    AccountNumberMasked: transaction.cc_number || transaction.check_account,
    CurrencyTypeValueId: transaction.cc_number ? 156 : 157,
    Guid: uuid.v4(),
  };
  PaymentDetail.AccountNumberMasked = PaymentDetail.AccountNumberMasked.replace(
    new RegExp("x", "gmi"), "*"
  );

  if (transaction.cc_number) {
    PaymentDetail.CreditCardTypeValueId = getCardType(PaymentDetail.AccountNumberMasked);
  }

  let CampusId;
  if (transaction.merchant_defined_field) {
    if (!isArray(transaction.merchant_defined_field)) {
      transaction.merchant_defined_field = [transaction.merchant_defined_field];
    }
    try {
      CampusId = Number(
        (find(transaction.merchant_defined_field, { id: "2"}) as any)._
      );
    } catch (e) {
      console.warn(`Cannot find campus in NMI for ${transaction.transaction_id}`);
    }

  }

  let Person: Person = {
    // Firstname conflicts with Nickname
    // FirstName: transaction.first_name,
    LastName: transaction.last_name,
    Email: transaction.email,
  };

  if (person) Person = { Id: person };

  const Location: Location = {
    Street1: transaction.address_1,
    Street2: transaction.address_2,
    City: transaction.city,
    State: transaction.state,
    PostalCode: transaction.postal_code,
    Country: transaction.country,
  };

  const ScheduledTransaction: FinancialScheduledTransaction = {};
  if (transaction.original_transaction_id) {
    ScheduledTransaction.GatewayScheduleId = transaction.original_transaction_id;
  }

  return {
    Transaction,
    Person,
    Location,
    TransactionDetails,
    PaymentDetail,
    CampusId,
    ScheduledTransaction,
  };
};
