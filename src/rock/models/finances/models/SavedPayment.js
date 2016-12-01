
import uuid from "node-uuid";

import { createGlobalId } from "../../../../util";
import {
  SavedPayment as SavedPaymentTable,
  FinancialPaymentDetail as FinancialPaymentDetailTable,
} from "../tables";

import nmi from "../util/nmi";
import { getCardType } from "../util/translate-nmi";

import { Rock } from "../../system";

export default class SavedPayment extends Rock {
  __type = "SavedPayment";

  async getFromId(id, globalId) {
    globalId = globalId ? globalId : createGlobalId(id, this.__type);
    return this.cache.get(globalId, () => SavedPaymentTable.find({ where: { Id: id }}));
  }

  async delFromCache(id) {
    this.cache.del(createGlobalId(id, this.__type));
  }

  async charge(token, gatewayDetails) {

    const complete = {
      "complete-action": {
        "api-key": gatewayDetails.SecurityKey,
        "token-id": token,
      },
    };

    return nmi(complete, gatewayDetails);
  }

  async validate({ token }, gatewayDetails) {
    if (!token) throw new Error("No token provided");

    return this.charge(token, gatewayDetails)
      .then(response => ({ code: response["result-code"], success: true, error: null }))
  }

  async save({ token, name, person }, gatewayDetails) {
    if (!token) throw new Error("No token provided");
    if (!person) throw new Error("Must be signed in to save a payment");

    return this.charge(token, gatewayDetails)
      .then(response => {
        let FinancialPaymentDetail = {};
        if (response.billing["cc-number"]) {
          FinancialPaymentDetail = {
            AccountNumberMasked: response.billing["cc-number"],
            CurrencyTypeValueId: 156,
            CreditCardTypeValueId: getCardType(response.billing["cc-number"]),
          };
        } else {
          FinancialPaymentDetail = {
            AccountNumberMasked: response.billing["account-number"],
            CurrencyTypeValueId: 157,
          };
        }

        FinancialPaymentDetail.Guid = uuid.v4();

        const FinancialPersonSavedAccounts = {
          Name: name || "Bank Card",
          ReferenceNumber: response["customer-vault-id"],
          TransactionCode: response["transaction-id"],
          Guid: uuid.v4(),
          PersonAliasId: person.PrimaryAliasId,
          FinancialGatewayId: gatewayDetails.Id,
          CreatedByPersonAliasId: person.PrimaryAliasId,
          ModifiedByPersonAliasId: person.PrimaryAliasId,
        }

        return FinancialPaymentDetailTable.post(FinancialPaymentDetail)
          .then((response) => {
            FinancialPersonSavedAccounts.FinancialPaymentDetailId = response;
            return SavedPaymentTable.post(FinancialPersonSavedAccounts)
          })
          .then(savedPaymentId => {
            this.delFromCache(savedPaymentId);
            return { savedPaymentId }
          });
      })
      .catch(e => ({ error: e.message, code: e.code }));;
  }

  async removeFromEntityId(entityId, gatewayDetails) {
    const globalId = createGlobalId(entityId, this.__type);

    // XXX should getFromId return a single item or an array?
    let existing = await this.getFromId(entityId);
    if (existing && existing.length) existing = existing[0];

    if (!existing || !existing.Id) return Promise.resolve({ error: "No saved account found" });

    return SavedPaymentTable.delete(existing.Id)
      .then(response => {
        if (response.status > 300) return response;
        if (!existing.ReferenceNumber) return response;

        // clear cache
        this.cache.del(globalId);

        return nmi({
          "delete-customer": {
            "api-key": gatewayDetails.SecurityKey,
            "customer-vault-id": existing.ReferenceNumber,
          },
        }, gatewayDetails);
      })
      .then(x => ({ ...x, ...{ Id: entityId }}))
      .catch(e => ({ error: e.message, code: e.code }));
  }

  async findByPersonAlias(aliases, { limit, offset }, { cache }) {
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
