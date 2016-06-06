
import { flatten } from "lodash";
import { createGlobalId } from "../../util";

export default {
  
  Navigation: {
    id: ({ id }: any, _, $, { parentType }) => createGlobalId(id, parentType.name),
    text: ({ text }) => text,
    link: ({ link }) => link,
    absoluteLink: ({ link, url }) => `${url}${link.substring(1, link.length)}`,
    sort: ({ sort }) => sort,
    image: ({ image }) => image,
    children: ({ children }) => children,
  },

}