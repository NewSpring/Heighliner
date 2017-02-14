import uuid from "node-uuid";
import { isArray, find, assign } from "lodash";
import Moment from "moment";

const d = /^6$|^6[05]$|^601[1]?$|^65[0-9][0-9]?$|^6(?:011|5[0-9]{2})[0-9\*]{0,12}$/gmi;

export const defaultCardRegex = {
  Visa: /^4[0-9\*]{0,15}$/gmi,
  MasterCard: /^5$|^5[1-5][0-9\*]{0,14}$/gmi,
  "American Express": /^3$|^3[47][0-9\*]{0,13}$/gmi,
  Discover: d,
};

export const getCardName = card => {
  for (const regex in defaultCardRegex) {
    if (defaultCardRegex[regex].test(card)) return regex;
  }
  return "Credit Card";
};

export const getCardType = card => {
  // XXX refering to the default was failing the tests?
  // I have not idea why
  const cards = {
    Visa: /^4[0-9\*]{0,15}$/gmi,
    MasterCard: /^5$|^5[1-5][0-9\*]{0,14}$/gmi,
    "American Express": /^3$|^3[47][0-9\*]{0,13}$/gmi,
    Discover: d,
  };
  const definedTypeMapping = {
    Visa: 7,
    MasterCard: 8,
    // check: 9,
    Discover: 160,
    "American Express": 159,
  };

  for (const regex in cards) {
    const isFound = cards[regex].test(card);
    if (isFound) return definedTypeMapping[regex];
  }

  return null;
};

export default (response, gateway, person) => {
  const transaction = assign({}, response);
  // reverse this when multiple accounts are stored in NMI correctly
  if (isArray(transaction.action)) {
    let sale = find(transaction.action, { action_type: "sale" });
    if (!sale) sale = find(transaction.action, { action_type: "settle" });
    if (!sale) sale = transaction.action = transaction.action[0];
    transaction.action = sale;
  }

  if (transaction.condition !== "complete") return null;
  if (
    transaction.action.action_type !== "sale" &&
    transaction.action.action_type !== "settle"
  ) {
    return null;
  }

  const Transaction = {
    TransactionCode: transaction.transaction_id,
    ForeignKey: transaction.order_id,
    TransactionTypeValueId: 53,
    Guid: uuid.v4(),
    FinancialGatewayId: gateway.Id,
    Summary: `Reference Number: ${transaction.transaction_id}`,
    SourceTypeValueId: 798, // XXX make this dynamic
    TransactionDateTime: Moment(
      transaction.action.date,
      "YYYYMMDDHHmmss",
    ).toISOString(),
  };

  const TransactionDetails = [];
  if (transaction.product) {
    if (!isArray(transaction.product)) {
      transaction.product = [transaction.product];
    }
    for (const product of transaction.product) {
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
      AccountId: Number(
        find(transaction.merchant_defined_field, { id: "1" })._,
      ),
      Guid: uuid.v4(),
    });
  }

  const PaymentDetail = {
    AccountNumberMasked: transaction.cc_number || transaction.check_account,
    CurrencyTypeValueId: transaction.cc_number ? 156 : 157,
    Guid: uuid.v4(),
  };
  PaymentDetail.AccountNumberMasked = PaymentDetail.AccountNumberMasked.replace(
    new RegExp("x", "gmi"),
    "*",
  );

  if (transaction.cc_number) {
    PaymentDetail.CreditCardTypeValueId = getCardType(
      PaymentDetail.AccountNumberMasked,
    );
  }

  let CampusId;
  if (transaction.merchant_defined_field) {
    if (!isArray(transaction.merchant_defined_field)) {
      transaction.merchant_defined_field = [transaction.merchant_defined_field];
    }
    try {
      CampusId = Number(
        find(transaction.merchant_defined_field, { id: "2" })._,
      );
    } catch (e) {
      console.warn(
        `Cannot find campus in NMI for ${transaction.transaction_id}`,
      );
    }
  }

  let Person = {
    // Firstname conflicts with Nickname
    // FirstName: transaction.first_name,
    LastName: transaction.last_name,
    Email: transaction.email,
  };

  if (person) Person = { Id: person };

  const Location = {
    Street1: transaction.address_1,
    Street2: transaction.address_2,
    City: transaction.city,
    State: transaction.state,
    PostalCode: transaction.postal_code,
    Country: transaction.country,
  };

  const ScheduledTransaction = {};
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
