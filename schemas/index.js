
// schema.js
import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
} from 'graphql';

import { People } from "../rock"
import person from "./person"
import likes from "./likes"
import allContent, { content } from "./content"

let schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      person,
      likes,
      allContent,
      content
    }
  })
});


export default schema;
