
import { GoogleConnector } from "../../fetch";

class GGeolocate extends GoogleConnector {
  private key: string = process.env.GOOGLE_GEO_LOCATE;
  private url: string = "https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&";

  public query(query) {
    const endpoint = `${this.url}${query}&key=${this.key}`;
    return this.get(endpoint);
  }

};

export default {
  GGeolocate,
};
