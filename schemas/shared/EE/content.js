// schema.js
import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
} from "graphql"

import ImageType from "./image"
import ColorType from "./color"

const ContentType = new GraphQLObjectType({
  name: "Content",
  fields: () => ({
    body: {
      type: GraphQLString,
      resolve: content => content.body
    },
    description: {
      type: GraphQLString,
      resolve: like => like.description
    },
    scripture: {
      type: GraphQLString,
      resolve: content => content.scripture
    },
    ooyalaId: {
      type: GraphQLString,
      resolve: content => content.ooyalaId
    },
    images: {
      type: new GraphQLList(ImageType),
      resolve: content => content.images
    },
    tags: {
      type: new GraphQLList(GraphQLString),
      resolve: content => content.tags
    },
    colors: {
      type: new GraphQLList(ColorType),
      resolve: content => content.colors
    },
    speakers: {
      type: GraphQLString,
      resolve: content => content.speakers
    }
  })
})

const FeedContentType = new GraphQLObjectType({
  name: "FeedContent",
  fields: () => ({
    images: {
      type: new GraphQLList(ImageType),
      resolve: content => content.images
    },
    colors: {
      type: new GraphQLList(ColorType),
      resolve: content => content.colors
    },
  })
});


export default ContentType;
export { FeedContentType };
