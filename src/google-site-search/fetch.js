import fetch from "isomorphic-fetch";
// import DataLoader from "dataloader";

export const connect = address => new Promise(cb => {
  cb(true);
});

export class GoogleConnector {
  count = 0;

  get(endpoint) {
    const label = `GoogleConnector${this.getCount()}`;
    const headers = {
      "user-agent": "Heighliner",
      "Content-Type": "application/json",
    };

    const options = { method: "GET", headers };
    console.time(label); // tslint:disable-line
    // XXX we can't cache google site search legally
    return fetch(endpoint, options)
      .then(x => x.json ? x.json() : x.text())
      .then(x => {
        console.timeEnd(label);
        return x;
      }); // tslint:disable-line
  }

  getCount() {
    this.count++;
    return this.count;
  }
}
