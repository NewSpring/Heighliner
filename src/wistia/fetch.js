import fetch from "isomorphic-fetch";
import { stringify } from "qs";

const BASE = "https://api.wistia.com/v1";
const UPLOAD = "https://upload.wistia.com";

export function connect() {
  return Promise.resolve(!!process.env.WISTIA_KEY);
}

export class WistiaFetchConnector {
  get(route, body) {
    return this.fetch("GET", `${BASE}/${route}.json?api_password=${process.env.WISTIA_KEY}`, JSON.stringify(body));
  }

  post(route, body) {
    return this.fetch("POST", `${BASE}/${route}.json?api_password=${process.env.WISTIA_KEY}`, JSON.stringify(body));
  }

  upload(body) {
    return this.fetch("POST", `${UPLOAD}/?api_password=${process.env.WISTIA_KEY}`, stringify(body), { "Content-Type": "application/x-www-form-urlencoded" });
  }

  fetch(method, url, body = {}, headers = {}) {
    return fetch(url, {
      headers, method, body,
    })
      .then((response) => {
        const { status, statusText, error } = response;

        if (status === 204) return { json: () => ({ status: 204, statusText: "success" }) };
        if (status >= 200 && status < 300) return response;
        if (status >= 400) {
          const err = new Error(statusText);
          err.code = status;
          throw err;
        }

        return {
          json: () => ({ status, statusText, error }),
        };
      })
      .then(x => x.json());
  }
}
