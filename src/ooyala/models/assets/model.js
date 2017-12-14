// import { OoyalaFetchConnector } from "../../fetch";
import OoyalaApi from "ooyala-api";
import { map } from "lodash";
import { defaultCache } from "../../../util/cache";

const { OOYALA_KEY, OOYALA_SECRET } = process.env;

class Ooyala {
  __type = "Ooyala";

  constructor({ cache } = { cache: defaultCache }) {
    // super();
    this.cache = cache;
    this.api = new OoyalaApi(OOYALA_KEY, OOYALA_SECRET, { concurrency: 6 });
  }

  // async get(query) {
  //   return await this.cache.get(`${this.__type}:${query}`, () => (
  //     this.api.get(query)
  //     .then((body) => {
  //       console.log("OoyalaRequest");
  //       return [body;
  //     })
  //       .catch((err) => {
  //         console.log(err);
  //       })
  //   ));
  // }

  async getLabels(query) {
    return await this.cache.get(`${this.__type}:Labels:${query}`, () => (
      this.api.get(`/v2/assets/${query}/labels`)
      .then(body => map(body.items, "name"))
        .catch((err) => {
          console.log(err);
        })
    ));
  }

  async getSource(query) {
    return await this.cache.get(`${this.__type}:Source:${query}`, () => (
      this.api.get(`/v2/assets/${query}/source_file_info`)
      .then(body => body.source_file_url)
        .catch((err) => {
          console.log(err);
        })
    ));
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
      this.api.get("/v2/assets/")
      .then(body => body.items)
        .catch((err) => {
          console.log(err);
        })
    ));
  }
}

export default {
  Ooyala,
};
