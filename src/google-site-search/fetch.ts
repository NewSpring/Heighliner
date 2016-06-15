
import fetch from "isomorphic-fetch";
// import DataLoader from "dataloader";

export function connect(address: string): Promise<boolean> {
  return new Promise((cb) => {
    const hasKeys = process.env.SEARCH_URL && process.env.SEARCH_KEY && process.env.SEARCH_CX;
    cb(hasKeys);
  });
}

export class SSFetchConnector {
  private cx: string = process.env.SEARCH_CX;
  private key: string = process.env.SEARCH_KEY;
  private url: string = process.env.SEARCH_URL;
  private count: number = 0;

  public get(query: string): Promise<any> {
    const label = `SSFetchConnector${this.getCount()}`;
    const headers = {
      "user-agent": "Heighliner",
      "Content-Type": "application/json",
    } as { [index: string]: string };

    const options = { method: "GET", headers };
    const endpoint = `${this.url}key=${this.key}&cx=${this.cx}&q=${query}`;

    console.time(label); // tslint:disable-line
    // XXX we can't cache google site search legally
    return fetch(endpoint, options)
      .then(x => x.json ? x.json() : x.text())
      .then(x => { console.timeEnd(label); return x; });  // tslint:disable-line
  }



  private getCount(): number {
    this.count++;
    return this.count;
  }

}
