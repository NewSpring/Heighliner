
import { createGlobalId } from "../../../../util";

import {
  SavedPayment as SavedPaymentTable,
} from "../tables";

import nmi from "../util/nmi";

import { Rock } from "../../system";

export default class SavedPayment extends Rock {
  __type = "SavedPayment";

  async getFromId(id, globalId) {
    globalId = globalId ? globalId : createGlobalId(id, this.__type);
    return this.cache.get(globalId, () => SavedPaymentTable.find({ where: { Id: id }}));
  }

  async removeFromNodeId(id, gatewayDetails) {
    const existing = await this.getFromId(id);
    if (!existing || !existing.Id) return Promise.resolve({ error: "No saved account found" });

    return SavedPaymentTable.delete(existing.Id)
      .then(response => {
        if (response.status > 300) return response;
        if (!existing.ReferenceNumber) return response;

        return nmi({
          "delete-customer": {
            "api-key": gatewayDetails.SecurityKey,
            "customer-vault-id": existing.ReferenceNumber,
          },
        }, gatewayDetails);
      })
      .catch(e => {
        return { error: e.message };
      });
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
