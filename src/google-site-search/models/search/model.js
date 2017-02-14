import { GoogleConnector } from "../../fetch";

class SSearch extends GoogleConnector {
  cx = process.env.SEARCH_CX;
  key = process.env.SEARCH_KEY;
  url = process.env.SEARCH_URL;

  query(query) {
    const endpoint = `${this.url}key=${this.key}&cx=${this.cx}&q=${query}`;
    return this.get(endpoint);
  }
}

export default {
  SSearch,
};
