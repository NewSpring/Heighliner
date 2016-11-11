
import { createGlobalId } from "../../../util";

export default {

  Query: {
    navigation: (_, { nav }, { models }) => models.Navigation.find({ nav }),
  },

  Navigation: {
    id: ({ id }, _, $, { parentType }) => createGlobalId(id, parentType.name),
    text: ({ text }) => text,
    link: ({ link }) => link,
    absoluteLink: ({ link, url }) => `${url}${link.substring(1, link.length)}`,
    sort: ({ sort }) => sort,
    image: ({ image }) => image,
    children: ({ children, id }, _, { models }) => { // tslint:disable-line
      if (children) return children;

      // XXX hookup up find by parent method
      return null;
      // return models.Navigation.findByParent(id);
    },
  },

};
