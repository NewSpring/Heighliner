import { ESVFetchConnector } from "../../fetch";

import { defaultCache } from "../../../util/cache";

class ESV extends ESVFetchConnector {
  __type = "ESV";

  constructor({ cache } = { cache: defaultCache }) {
    super();
    this.cache = cache;
  }

  async get(query) {
    return await this.cache.get(
      `${this.__type}:${query}`,
      () => this.getFromAPI(query),
    );
  }
}

export default {
  ESV,
};
