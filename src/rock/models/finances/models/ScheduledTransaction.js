
import { createGlobalId } from "../../../../util";

import {
  Transaction as TransactionTable,
  ScheduledTransaction as ScheduledTransactionTable,
  ScheduledTransactionDetail,
} from "../tables";

import { Rock } from "../../system";

export default class ScheduledTransaction extends Rock {
  __type = "ScheduledTransaction";

  async getFromId(id, globalId) {
    globalId = globalId ? globalId : createGlobalId(`${id}`, this.__type);
    return this.cache.get(globalId, () => ScheduledTransactionTable.findOne({ where: { Id: id }}));
  }

  async getTransactionsById(id) {
    if (!id) return Promise.resolve(null);
    const globalId = createGlobalId(`${id}`, "ScheduledTransactionTransactions");
    return this.cache.get(globalId, () => TransactionTable.find({
        where: { ScheduledTransactionId: id },
        order: [ ["TransactionDateTime", "DESC"] ],
      })
    );
  }

  async getDetailsByScheduleId(id) {
    if (!id) return Promise.resolve(null);
    const globalId = createGlobalId(`${id}`, "ScheduledTransactionDetails");
    // XXX why isn't this caching?
    return this.cache.get(globalId, () => ScheduledTransactionDetail.find({
        where: { ScheduledTransactionId: id },
      })
    );
  }

  async findByPersonAlias(aliases, { limit, offset, isActive }, { cache }) {
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
