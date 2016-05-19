
// schema.js
import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
} from "graphql"

const ImageType = new GraphQLObjectType({
  name: "Image",
  fields: () => ({
    fileName: {
      type: GraphQLString,
      resolve: image => image.fileName
    },
    fileType: {
      type: GraphQLString,
      resolve: image => image.fileType
    },
    fileLabel: {
      type: GraphQLString,
      resolve: image => image.fileLabel
    },
    s3: {
      type: GraphQLString,
      resolve: image => image.s3
    },
    cloudfront: {
      type: GraphQLString,
      resolve: image => image.cloudfront
    }
  })
})

export default ImageType
