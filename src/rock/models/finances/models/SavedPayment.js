
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
