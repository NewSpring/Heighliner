import { WistiaFetchConnector } from "../../fetch";

import { defaultCache } from "../../../util/cache";

class Wistia extends WistiaFetchConnector {
  __type = "Wistia";

  constructor({ cache } = { cache: defaultCache }) {
    super();
    this.cache = cache;
  }

  async getProject(query) {
    // return await this.cache.get(`${this.__type}:Projects:${query}`, () => (
    return await this.get(`projects/${query}`)
      .then(body => body)
      .catch((err) => {
        console.log(err);
      });
    // ));
  }

  async createProject(name) {
    return await this.post("projects", { name })
      .then(body => body)
      .catch((err) => {
        console.log(err);
      });
  }

  async getMedia(query) {
    // return await this.cache.get(`${this.__type}:Labels:${query}`, () => (
    return await this.get(`medias/${query}`)
      .then(body => body)
      .catch((err) => {
        console.log(err);
      });
    // ));
  }

  async createMedia(data) {
    return await this.upload(data)
      .then(body => body)
      .catch((err) => {
        console.log(err);
      });
  }
}

export default {
  Wistia,
};
