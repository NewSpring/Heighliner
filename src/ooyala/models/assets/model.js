import OoyalaApi from "ooyala-api";
import { map } from "lodash";
import { defaultCache } from "../../../util/cache";

const { OOYALA_KEY, OOYALA_SECRET } = process.env;

class Ooyala {
  __type = "Ooyala";

  constructor({ cache } = { cache: defaultCache }) {
    this.cache = cache;
    this.api = new OoyalaApi(OOYALA_KEY, OOYALA_SECRET, { concurrency: 6 });
  }

  async getLabels(query) {
    return await this.cache.get(`${this.__type}:Labels:${query}`, () => (
      this.api.get(`/v2/assets/${query}/labels`)
      .then((body) => {
        return body.items;
      })
        .catch((err) => {
          console.log(err);
        })
    ));
  }

  // Shouldn't be cached because result is time sensative
  async getSource(query) {
    return await this.api.get(`/v2/assets/${query}/source_file_info`)
      .then(body => body.source_file_url)
      .catch((err) => {
        console.log(err);
      });
  }

  async getAsset(query) {
    return await this.cache.get(`${this.__type}:Asset:${query}`, () => (
      this.api.get(`/v2/assets/${query}`)
      .then(body => body)
        .catch((err) => {
          console.log(err);
        })
    ));
  }

  async getBacklot() {
    return await this.cache.get(`${this.__type}:Backlot`, () => (
      // leaving both api calls in for reference.
      // .get(path, queryparams, options)
      // this.api.get("/v2/assets", null, { recursive: true })
      this.api.get("/v2/assets", { limit: 10 })
      .then((body) => {
        if (body.items !== undefined) {
          return body.items;
        }

        return body;
      })
      .catch((err) => {
        console.log(err);
      })
    ));
  }
}

export default {
  Ooyala,
};
