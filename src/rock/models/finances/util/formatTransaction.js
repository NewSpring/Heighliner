import uuid from "node-uuid";
import { isNil, omitBy } from "lodash";
import { getCardType } from "./translate-nmi";

export default ({ response, person = {}, accountName }, gatewayDetails) => {
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

  const FinancialTransaction = {
    TransactionCode: response["transaction-id"],
    TransactionTypeValueId: 53,
    FinancialGatewayId: gatewayDetails.Id,
    Summary: `Reference Number: ${response["transaction-id"]}`,
    Guid: uuid.v4(),
    TransactionDateTime: new Date(),
  };

  let Person = {};
  if (person) {
    Person = {
      PrimaryAliasId: person.PrimaryAliasId,
      PersonId: person.Id,
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

  // eslint-disable-next-line
  if (!Array.isArray(response.product)) response.product = [response.product];

  const TransactionDetails = [];
  // eslint-disable-next-line
  for (const product of response.product) {
    TransactionDetails.push({
      AccountId: Number(product["product-code"]),
      AccountName: product.description,
      Amount: Number(product["total-amount"]),
      Guid: uuid.v4(),
    });
  }

  const Campus = {
    Id: response["merchant-defined-field-2"],
  };

  return {
    Campus,
    FinancialPaymentDetail,
    FinancialPersonSavedAccount,
    FinancialTransaction,
    Location,
    Person,
    TransactionDetails,
  };
};
