import { orderBy } from "lodash";
import { Cache, defaultCache } from "../../util/cache";

import {
  ChannelTitles,
  channelTitleSchema,
} from "../tables/channels";

import {
  Navee,
  NaveeNav,
} from "../tables/navee";

import {
  Sites,
} from "../tables/sites";

import { EE } from "../ee";

export class Navigation extends EE {
  private cache: Cache

  constructor({ cache } = { cache: defaultCache }) {
    super();
    this.cache = cache;
  }
  
  
  // XXX support getting children from the node interface 
  public async getFromId(id: string): Promise<any> { // XXX correctly type
    return Navee.findOne({
      where: { navee_id: id },
      include: [
        { model: Sites.model },
      ],
    })
      .then(x => {
        x.site_pages = Sites.parsePage(x.exp_site.site_pages)[x.site_id]
        return x
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
      })
      ;
  }
  

  public async find({ nav }: { nav: string }): Promise<any> {
    let navigation = {};
    let orphans = [];
    return await NaveeNav.find({
      where: { nav_title: nav },
      include: [
        { model: Navee.model },
        { model: Sites.model },
      ],
    })
      .then(data => data.map(x => {
        x.exp_navee.site_pages = Sites.parsePage(x.exp_site.site_pages)[x.site_id]
        return x.exp_navee
      }))
      .then(data => data.map(x => {
        
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
      }))
      .then(data => {
        // get all parents
        data.filter(x => x.parent === 0).forEach(x => {
          navigation[x.id] = x;
          return;
        });
        // get all children
        data.filter(x => x.parent != 0).forEach(x => {
          if (navigation[x.parent]) {
            navigation[x.parent].children || (navigation[x.parent].children = []);
            navigation[x.parent].children.push(x);
            return;
          }
          // XXX make this recursive
          orphans.push(x);
        });
        return [navigation];
      })
      .then(() => {
        let results = [];
        for (let parent in navigation) {
          parent = navigation[parent];
          parent.children = orderBy(parent.children, "sort");
          results.push(parent);
        }
        return orderBy(results, "sort");
      })
      ;
  }
}

export default {
  Navigation,
};
