import { merge } from "lodash";
import { defaultCache } from "../../../util/cache";
import { createGlobalId } from "../../../util";

import { ContentChannel, ContentChannelItem } from "./tables";

import { Rock } from "../system";

export class RockContent extends Rock {
  __type = "RockContent";

  constructor({ cache } = { cache: defaultCache }) {
    super();
    this.cache = cache;
  }

  find(channel) {
    return {
      Channel: channel,
    };
  }
}

export default {
  RockContent,
};
