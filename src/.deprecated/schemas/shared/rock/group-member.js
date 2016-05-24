
// schema.js
import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLBoolean,
} from "graphql"

import { api, People, parseEndpoint } from "../../../rock"
import { PersonType } from "./person"

const GroupMemberType = new GraphQLObjectType({
  name: "GroupMember",
  fields: () => ({
    id: { type: GraphQLInt, resolve: member => member.Id },
    role: { type: GraphQLString, resolve: member => member.GroupRole.Name },
    person: { type: PersonType, resolve: member => member.Person}
  })
})

export {
  GroupMemberType
}
