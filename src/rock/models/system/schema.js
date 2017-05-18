
export default [`
  type DefinedValue implements Node {
    id: ID!
    _id: Int
    value: String
    description: String
  }
  type Attribute implements Node {
    id: ID!
    key: String!
    description: String!
    order: Int
    values: [AttributeValue]
  }
  type AttributeValue implements Node {
    attribute: Attribute
    id: ID!
    value: String
  }
`];
