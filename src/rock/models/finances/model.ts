import { orderBy } from "lodash";
import { Cache, defaultCache } from "../../../util/cache";

import {
  Person,
  PersonAlias,
} from "./tables";

import { Rock } from "../../rock";

class FinancialModel extends Rock {
  private cache: Cache

  constructor({ cache } = { cache: defaultCache }) {
    super();
    this.cache = cache;
  }
}

export class Transactions extends FinancialModel {
  public async getFromId(id: string, globalId: string): Promise<any> { // XXX correctly type
    return Promise.resolve();
  }
}

export class ScheduledTransactions extends FinancialModel {
  public async getFromId(id: string, globalId: string): Promise<any> { // XXX correctly type
    return Promise.resolve();
  }
}

export class SavedPayments extends FinancialModel {
  public async getFromId(id: string, globalId: string): Promise<any> { // XXX correctly type
    return Promise.resolve();
  }
}

export class FinancialAccounts extends FinancialModel {
  public async getFromId(id: string, globalId: string): Promise<any> { // XXX correctly type
    return Promise.resolve();
  }
}

export default {
  Transactions,
  ScheduledTransactions,
  SavedPayments,
  FinancialAccounts,
};