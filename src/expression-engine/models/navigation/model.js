import { orderBy } from "lodash";
import { defaultCache } from "../../../util/cache";

// import {
//   ChannelTitles,
//   channelTitleSchema,
// } from "../content/tables";

import { Navee, NaveeNav } from "../navigation/tables";

import { Sites } from "../ee/sites";

import { EE } from "../ee";

export class Navigation extends EE {
  constructor({ cache } = { cache: defaultCache }) {
    super({ cache });
    this.cache = cache;
  }

  // XXX add caching
  // XXX support getting children from the node interface
  async getFromId(id) {
    return this.cache
      .get(id, () =>
        Navee.findOne({
          where: { navee_id: id },
          include: [{ model: Sites.model }],
        })
      )
      .then(x => {
        x.site_pages = Sites.parsePage(x.exp_site.site_pages)[x.site_id];
        return x;
      })
      .then(x => {
        if (x.type === "pages" && x.entry_id) {
          x.link = x.site_pages.uris[x.entry_id];
        }

        return {
          link: x.link,
          id: x.navee_id,
          text: x.text,
          url: x.site_pages.url,
          parent: x.parent,
          sort: x.sort,
          image: x.custom,
        };
      });
  }

  async find({ nav }) {
    const navigation = {};
    const orphans = [];
    return await NaveeNav.find({
      where: { nav_title: nav },
      include: [{ model: Navee.model }, { model: Sites.model }],
    })
      .then(data =>
        data.map(x => {
          x.exp_navee.site_pages = Sites.parsePage(x.exp_site.site_pages)[
            x.site_id
          ];
          return x.exp_navee;
        })
      )
      .then(data =>
        data.map(x => {
          if (x.type === "pages" && x.entry_id) {
            x.link = x.site_pages.uris[x.entry_id];
          }

          return {
            link: x.link,
            id: x.navee_id,
            text: x.text,
            url: x.site_pages.url,
            parent: x.parent,
            sort: x.sort,
            image: x.custom,
          };
        })
      )
      .then(data => {
        // get all parents
        data.filter(x => x.parent === 0).forEach(x => {
          navigation[x.id] = x;
        });
        // get all children
        data.filter(x => x.parent !== 0).forEach(x => {
          if (navigation[x.parent]) {
            navigation[x.parent].children ||
              (navigation[x.parent].children = []); // tslint:disable-line
            navigation[x.parent].children.push(x);
            return;
          }
          // XXX make this recursive
          orphans.push(x);
        });
        return [navigation];
      })
      .then(() => {
        const results = [];
        for (const parent in navigation) {
          const item = navigation[parent];
          item.children = orderBy(item.children, "sort");
          results.push(item);
        }
        return orderBy(results, "sort");
      });
  }
}

export default {
  Navigation,
};
