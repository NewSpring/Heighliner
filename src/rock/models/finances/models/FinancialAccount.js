import { merge, isUndefined } from "lodash";
import { createGlobalId } from "../../../../util";

import { FinancialAccount as FinancialAccountTable } from "../tables";

import { Rock } from "../../system";

export default class FinancialAccount extends Rock {
  __type = "FinancialAccount";

  async getFromId(id, globalId) {
    globalId = globalId || createGlobalId(id, this.__type);
    return this.cache.get(globalId, () =>
      FinancialAccountTable.findOne({ where: { Id: id } }).then(x => {
        // if this is a children fund, lets get the parent
        if (!x.ParentAccountId) return x;

        return FinancialAccountTable.findOne({
          where: { Id: x.ParentAccountId }
        });
      })
    );
  }

  async find(where, { all }) {
    for (const key in where) {
      if (isUndefined(where[key])) delete where[key];
    }
    // defaults
    where = merge(
      {
        ParentAccountId: null,
        PublicDescription: {
          $and: {
            $ne: "",
            $not: null
          }
        },
        IsTaxDeductible: true
      },
      where
    );

    if (all) {
      where = { ParentAccountId: null, IsTaxDeductible: true };
    }

    return await this.cache.get(this.cache.encode(where), () =>
      FinancialAccountTable.find({
        where,
        attributes: ["Id"],
        order: ["Order"]
      }).then(this.getFromIds.bind(this))
    );
  }
}
