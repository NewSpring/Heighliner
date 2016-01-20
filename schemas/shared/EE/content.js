// schema.js
import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
} from "graphql"

import ImageType from "./image"

const ContentType = new GraphQLObjectType({
  name: "Content",
  fields: () => ({
    body: {
      type: GraphQLString,
      resolve: content => content.body
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
    }
  })
})


export default ContentType
