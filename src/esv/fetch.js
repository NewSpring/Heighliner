
import fetch from "isomorphic-fetch";

export function connect() {
  return new Promise((cb) => {
    const hasKey = process.env.ESV_KEY;
    cb(hasKey);
  });
}

export class ESVFetchConnector {
  baseUrl = "http://www.esvapi.org/v2/rest/passageQuery";
  key = process.env.ESV_KEY;
  count = 0;

  public getFromAPI(query) {
    const label = `ESVFetchConnector${this.getCount()}`;

    const request = this.getRequest(query);

    const headers = {
      "user-agent": "Heighliner",
      "Content-Type": "application/text",
    } as { [index] };

    const options = { method: "GET", headers };

    console.time(label);

    return fetch(request, options)
      .then(x => x.text())
      .then(x => { console.timeEnd(label); return x; });
  }

  private getRequest(query) {
    let request = `${this.baseUrl}?key=${this.key}`;
    request += `&passage=${query}`;
    request += "&include-headings=false";
    request += "&include-passage-references=false";
    request += "&include-footnotes=false";
    request += "&include-audio-link=false";
    request += "&include-short-copyright=false";
    return request;
  }

  private getCount() {
    this.count++;
    return this.count;
  }

}
