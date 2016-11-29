
export default [`
  type DefinedValue implements Node {
    id: ID!
    _id: Int
    value: String
    description: String
  }

  type Note implements Node {
    id: ID!
    entityId: Int
    text: String
  }
`];
