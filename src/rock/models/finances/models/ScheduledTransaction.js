import { createGlobalId } from "../../../../util";
import nmi from "../util/nmi";

import {
  Transaction as TransactionTable,
  ScheduledTransaction as ScheduledTransactionTable,
  ScheduledTransactionDetail
} from "../tables";

import { Rock } from "../../system";

export default class ScheduledTransaction extends Rock {
  __type = "ScheduledTransaction";

  async getFromId(id, globalId) {
    globalId = globalId || createGlobalId(`${id}`, this.__type);
    return this.cache.get(globalId, () =>
      ScheduledTransactionTable.findOne({ where: { Id: id } })
    );
  }

  async getTransactionsById(id) {
    if (!id) return Promise.resolve(null);
    const globalId = createGlobalId(
      `${id}`,
      "ScheduledTransactionTransactions"
    );
    return this.cache.get(globalId, () =>
      TransactionTable.find({
        where: { ScheduledTransactionId: id },
        order: [["TransactionDateTime", "DESC"]]
      })
    );
  }

  async getDetailsByScheduleId(id) {
    if (!id) return Promise.resolve(null);
    const globalId = createGlobalId(`${id}`, "ScheduledTransactionDetails");
    // XXX why isn't this caching?
    return this.cache.get(globalId, () =>
      ScheduledTransactionDetail.find({
        where: { ScheduledTransactionId: id }
      })
    );
  }

  async findByPersonAlias(aliases, { limit, offset, isActive }, { cache }) {
    const query = { aliases, limit, offset, isActive };
    return await this.cache
      .get(
        this.cache.encode(query),
        () =>
          ScheduledTransactionTable.find({
            where: {
              AuthorizedPersonAliasId: { $in: aliases },
              IsActive: isActive
            },
            order: [["CreatedDateTime", "DESC"]],
            attributes: ["Id"],
            limit,
            offset
          }),
        { cache }
      )
      .then(this.getFromIds.bind(this));
  }

  async cancelNMISchedule(id, gatewayDetails) {
    const existing = await this.getFromId(id);
    if (!existing) return Promise.resolve({ error: "Schedule not found" });

    const payload = {
      "delete-subscription": {
        "api-key": gatewayDetails.SecurityKey,
        "subscription-id": existing.GatewayScheduleId
      }
    };

    return nmi(payload, gatewayDetails)
      .catch(error => {
        // If this schedule isn't in NMI, go ahead and clean up Rock
        if (
          !/Transaction not found/.test(error.message) &&
          !/No recurring subscriptions found/.test(error.message)
        )
          throw error;
      })
      .then(() => {
        if (existing.GatewayScheduleId) {
          return ScheduledTransactionTable.patch(existing.Id, {
            IsActive: false
          });
        }

        return ScheduledTransactionTable.delete(existing.Id);
      })
      .then(() => {
        const nodeId = createGlobalId(`${existing.Id}`, this.__type);
        this.cache.del(nodeId);
        return { scheduleId: existing.Id };
      })
      .catch(error => ({ code: error.code, error: error.message }));
  }
}
