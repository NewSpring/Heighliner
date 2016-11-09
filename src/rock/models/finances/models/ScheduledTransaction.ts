
import { createGlobalId } from "../../../../util";

import {
  Transaction as TransactionTable,
  ScheduledTransaction as ScheduledTransactionTable,
  ScheduledTransactionDetail,
} from "../tables";

import { Rock } from "../../system";

export default class ScheduledTransaction extends Rock {
  public __type: string = "ScheduledTransaction";

  public async getFromId(id: string, globalId: string): Promise<any> { // XXX correctly type
    globalId = globalId ? globalId : createGlobalId(`${id}`, this.__type);
    return this.cache.get(globalId, () => ScheduledTransactionTable.findOne({ where: { Id: id }}));
  }

  public async getTransactionsById(id: string | number): Promise<any> {
    if (!id) return Promise.resolve(null);
    const globalId = createGlobalId(`${id}`, "ScheduledTransactionTransactions");
    return this.cache.get(globalId, () => TransactionTable.find({
        where: { ScheduledTransactionId: id },
        order: [ ["TransactionDateTime", "DESC"] ],
      })
    );
  }

  public async getDetailsByScheduleId(id: string | number): Promise<any> {
    if (!id) return Promise.resolve(null);
    const globalId = createGlobalId(`${id}`, "ScheduledTransactionDetails");
    // XXX why isn't this caching?
    return this.cache.get(globalId, () => ScheduledTransactionDetail.find({
        where: { ScheduledTransactionId: id },
      })
    );
  }

  public async findByPersonAlias(
    aliases: string | number,
    { limit, offset, isActive }, { cache }
  ): Promise<any> {
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
