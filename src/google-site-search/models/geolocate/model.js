
import { GoogleConnector } from "../../fetch";

class GGeolocate extends GoogleConnector {
  key = process.env.GOOGLE_GEO_LOCATE;
  url = "https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&";

  query(query) {
    const endpoint = `${this.url}${query}&key=${this.key}`;
    return this.get(endpoint);
  }

};

export default {
  GGeolocate,
};
