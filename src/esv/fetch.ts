
import fetch from "isomorphic-fetch";

export function connect(): Promise<boolean> {
  return new Promise((cb) => {
    const hasKey = process.env.ESV_KEY;
    cb(hasKey);
  });
}

export class ESVFetchConnector {
  private baseUrl: string = "http://www.esvapi.org/v2/rest/passageQuery";
  private key: string = process.env.ESV_KEY;
  private count: number = 0;

  public get(query: string): Promise<any> {
    const label = `ESVFetchConnector${this.getCount()}`;

    const request = this.getRequest(query);

    const headers = {
      "user-agent": "Heighliner",
      "Content-Type": "application/text",
    } as { [index: string]: string };

    const options = { method: "GET", headers };

    console.time(label); // tslint:disable-line
    // XXX we CAN cache the ESV responses!

    return fetch(request, options)
      .then(x => x.text())
      .then(x => { console.timeEnd(label); return x; }); // tslint:disable-line
  }

  private getRequest(query: string): string {
    let request = `${this.baseUrl}?key=${this.key}`;
    request += `&passage=${query}`;
    request += "&include-headings=false";
    request += "&include-passage-references=false";
    request += "&include-footnotes=false";
    request += "&include-audio-link=false";
    request += "&include-short-copyright=false";
    return request;
  }

  private getCount(): number {
    this.count++;
    return this.count;
  }

}
