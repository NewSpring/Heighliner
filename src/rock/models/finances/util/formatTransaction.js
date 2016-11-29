
import moment from "moment";
import uuid from "node-uuid";
import { isNil, omitBy } from "lodash";
import { getCardType } from "./translate-nmi";

export default ({ response, person = {}, accountName, origin, scheduleId }, gatewayDetails) => {
  let FinancialPaymentDetail = {};

  if (response.billing["cc-number"]) {
    FinancialPaymentDetail = {
      AccountNumberMasked: response.billing["cc-number"],
      CurrencyTypeValueId: 156,
      CreditCardTypeValueId: getCardType(response.billing["cc-number"]),
      Guid: uuid.v4(),
    };
  } else {
    FinancialPaymentDetail = {
      AccountNumberMasked: response.billing["account-number"],
      CurrencyTypeValueId: 157,
      Guid: uuid.v4(),
    };
  }

  const Transaction = {
    TransactionCode: response["transaction-id"],
    TransactionTypeValueId: 53,
    FinancialGatewayId: gatewayDetails.Id,
    Summary: `Reference Number: ${response["transaction-id"]}`,
    Guid: uuid.v4(),
    // EST
    TransactionDateTime: moment().subtract(5, "hours"),
  };

  const Schedule = omitBy({
    Id: scheduleId,
    GatewayScheduleId: response["subscription-id"],
    TransactionFrequencyValue: response.plan,
    IsActive: true,
    Guid: uuid.v4(),
  }, isNil);

  if (response["merchant-defined-field-3"]) {
    const date = `${moment(response["merchant-defined-field-3"], "YYYYMMDD").toISOString()}`;
    Schedule.StartDate = date;
    Schedule.NextPaymentDate = date;
  }

  let Person = {};
  if (person && person.PrimaryAliasId) {
    Person = {
      PrimaryAliasId: person.PrimaryAliasId,
      Id: person.Id,
    };
  } else {
    Person = omitBy({
      FirstName: response.billing["first-name"],
      LastName: response.billing["last-name"],
      Email: response.billing.email,
      Guid: uuid.v4(),
      IsSystem: false,
      Gender: 0,
      ConnectionStatusValueId: 67, // Web Prospect
      SystemNote: "Created from Apollos",
    }, isNil);
  }

  const Location = omitBy({
    Street1: response.billing.address1,
    Street2: response.billing.address2,
    City: response.billing.city,
    State: response.billing.state,
    Postal: response.billing.postal,
    Guid: uuid.v4(),
  }, isNil);

  const FinancialPersonSavedAccount = omitBy({
    Name: accountName,
    ReferenceNumber: response["customer-vault-id"],
    TransactionCode: response["transaction-id"],
    FinancialGatewayId: gatewayDetails.Id,
    Guid: uuid.v4(),
  }, isNil);

  if (!response.product) {
    // eslint-disable-next-line
    response.product = [{
      "product-code": response["merchant-defined-field-1"],
      "total-amount": response.plan.amount,
    }];
  }
  // eslint-disable-next-line
  if (!Array.isArray(response.product)) response.product = [response.product];

  const TransactionDetails = [];
  // eslint-disable-next-line
  for (const product of response.product) {
    TransactionDetails.push(omitBy({
      AccountId: Number(product["product-code"]),
      AccountName: product.description,
      Amount: Number(product["total-amount"]),
      Guid: uuid.v4(),
    }, isNil));
  }

  const Campus = {
    Id: response["merchant-defined-field-2"],
  };

  const SourceTypeValue = {
    Url: origin,
  };

  return {
    Campus,
    FinancialPaymentDetail,
    FinancialPersonSavedAccount,
    Transaction,
    Schedule,
    Location,
    Person,
    TransactionDetails,
    SourceTypeValue,
  };
};
