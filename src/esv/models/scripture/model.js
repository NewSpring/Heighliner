import { ESVFetchConnector } from "../../fetch";

import { defaultCache } from "../../../util/cache";

class ESV extends ESVFetchConnector {
  __type = "ESV";

  constructor({ cache }) {
    super();
    this.cache = cache;
  }

  async get(query: string) {
    return await this.cache.get(`${this.__type}:${query}`, () => (
      this.getFromAPI(query)
    ));
  }
};

export default {
  ESV,
};
