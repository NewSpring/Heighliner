
import fetch from "isomorphic-fetch";
// import DataLoader from "dataloader";

export function connect(address: string): Promise<boolean> {
  return new Promise((cb) => {
    cb(true);
  });
}

export class GoogleConnector {
  private count: number = 0;

  public get(endpoint: string): Promise<any> {
    const label = `GoogleConnector${this.getCount()}`;
    const headers = {
      "user-agent": "Heighliner",
      "Content-Type": "application/json",
    } as { [index: string]: string };

    const options = { method: "GET", headers };
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
