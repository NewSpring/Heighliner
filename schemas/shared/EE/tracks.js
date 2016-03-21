// schema.js
import {
  GraphQLObjectType,
  GraphQLString,
} from "graphql"

const TrackType = new GraphQLObjectType({
  name: "Tracks",
  fields: () => ({
    title: {
      type: GraphQLString,
      resolve: track => track.title
    },
    duration: {
      type: GraphQLString,
      resolve: track => track.duration
    },
    file: {
      type: GraphQLString,
      resolve: track => track.file
    }
  })
})

export default TrackType
