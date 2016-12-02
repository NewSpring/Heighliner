
import uuid from "node-uuid";
import moment from "moment";

import { createGlobalId } from "../../../../util";

import {
  FinancialBatch as FinancialBatchTable,
} from "../tables";

import { Rock } from "../../system";

export default class FinancialBatch extends Rock {
  __type = "FinancialBatch";

  async getFromId(id, globalId) {
    globalId = globalId ? globalId : createGlobalId(id, this.__type);
    return this.cache.get(globalId, () => FinancialBatchTable.findOne({ where: { Id: id }}));
  }

  async findOrCreate({ prefix = "Online Giving", suffix = "", currencyType, date }) {
    let paymentType = "";
    if (currencyType) paymentType = currencyType;

    const batchName = `${prefix} ${paymentType} ${suffix}`.trim();

    const batch = await FinancialBatchTable.find({
      where: {
        Status: 1,
        BatchStartDateTime: { $lte: date },
        BatchEndDateTime: { $gt: date },
        Name: batchName,
      },
    });

    if (batch.length) return batch[0];

    const BatchStartDateTime = moment(date)
      .startOf("day")
      // .subtract(5, "hours")
      .subtract(1, "minute")
      .add(1, "day")
      .toISOString();

    const BatchEndDateTime = moment(date)
      .endOf("day")
      // .subtract(5, "hours")
      .subtract(1, "minute")
      .add(1, "day")
      .toISOString();

    const newBatch = {
      Guid: uuid.v4(),
      Name: batchName,
      Status: 1,
      ControlAmount: 0,
      // XXX this is actually stored on the payment gateway if we want to make
      // it a dynamic value
      BatchStartDateTime,
      BatchEndDateTime,
    };

    const batchId = await FinancialBatchTable.post(newBatch);
    return FinancialBatchTable.findOne({ where: { Id: batchId } });
  }

}
