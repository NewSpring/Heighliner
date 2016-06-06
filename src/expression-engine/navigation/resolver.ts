
import { flatten } from "lodash";
import { createGlobalId } from "../../util";

export default {
  
  Navigation: {
    id: ({ entry_id }: any, _, $, { parentType }) => createGlobalId(entry_id, parentType.name),
    text: ({ text }) => text,
    link: ({ link }) => link,
    sort: ({ sort }) => sort,
    image: ({ image }) => image,
    children: ({ children }) => children,
  }

}