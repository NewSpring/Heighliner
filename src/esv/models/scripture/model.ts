import { ESVFetchConnector } from "../../fetch";

import { Cache, defaultCache } from "../../../util/cache";

class ESV extends ESVFetchConnector {
  public __type: string = "ESV";
  public cache: Cache;

  constructor({ cache } = { cache: defaultCache }) {
    super();
    this.cache = cache;
  }

  public async get(query: string): Promise<string> {
    return await this.cache.get(`${this.__type}:${query}`, () => (
      this.getFromAPI(query)
    )) as string;
  }
};

export default {
  ESV,
};
