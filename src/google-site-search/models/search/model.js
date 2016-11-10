
import { GoogleConnector } from "../../fetch";

class SSearch extends GoogleConnector {
  private cx: string = process.env.SEARCH_CX;
  private key: string = process.env.SEARCH_KEY;
  private url: string = process.env.SEARCH_URL;

  public query(query) {
    const endpoint = `${this.url}key=${this.key}&cx=${this.cx}&q=${query}`;
    return this.get(endpoint);
  }

};

export default {
  SSearch,
};
