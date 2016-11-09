
import { createGlobalId } from "../../../../util";

import {
  SavedPayment as SavedPaymentTable,
} from "../tables";

// import removeSavedPaymentFromNMI from "../util/removeSavedPayment";

import { Rock } from "../../system";

export default class SavedPayment extends Rock {
  public __type: string = "SavedPayment";

  public async getFromId(id: string, globalId?: string): Promise<any> { // XXX correctly type
    globalId = globalId ? globalId : createGlobalId(id, this.__type);
    return this.cache.get(globalId, () => SavedPaymentTable.find({ where: { Id: id }}));
  }

  public async removeFromNodeId(id: string): Promise<any> {
    const existing = await this.getFromId(id);
    if (!existing || !existing.Id) return Promise.resolve({ error: "No saved account found" });

    return SavedPaymentTable.delete(existing.Id)
      .then(response => {
        if (response.status > 300) return response;
        if (!existing.ReferenceNumber) return response;

        // XXX how do we want to handle NMI checks? Hard code the id?
        // return removeSavedPaymentFromNMI(existing.ReferenceNumber);
      });
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
