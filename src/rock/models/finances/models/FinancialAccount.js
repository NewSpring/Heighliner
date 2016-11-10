import { merge, isUndefined } from "lodash";
import { createGlobalId } from "../../../../util";

import {
  FinancialAccount as FinancialAccountTable,
} from "../tables";

import { Rock } from "../../system";

export default class FinancialAccount extends Rock {
  public __type: string = "FinancialAccount";

  public async getFromId(id: string, globalId: string): Promise<any> { // XXX correctly type
    globalId = globalId ? globalId : createGlobalId(id, this.__type);
    return this.cache.get(
      globalId,
      () => FinancialAccountTable.findOne({ where: { Id: id }})
        .then(x => {
          // if this is a children fund, lets get the parent
          if (!x.ParentAccountId) return x;

          return FinancialAccountTable.findOne({ where: { Id: x.ParentAccountId }});
        })
    );
  }

  public async find(where: any): Promise<any> {

    for (let key in where) {
      if (isUndefined(where[key])) delete where[key];
    }
    // defaults
    where = merge({
      ParentAccountId: null,
      PublicDescription: {
        $and: {
          $ne: "",
          $not: null,
        },
      },
      IsTaxDeductible: true,
    }, where);
    return await this.cache.get(
      this.cache.encode(where),
      () => FinancialAccountTable.find({ where, attributes: ["Id"], order: ["Order"] })
        .then(this.getFromIds.bind(this))
    );
  }

}
