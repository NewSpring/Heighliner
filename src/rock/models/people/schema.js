export default [
  `
  type PhoneNumber implements Node {
    id: ID!
    countryCode: String
    description: String
    canText: Boolean!
    rawNumber: String!
    number: String!
    person: Person
  }

  type Person implements Node {
    id: ID!
    entityId: Int!
    guid: String!
    firstName: String!
    lastName: String!
    nickName: String
    phoneNumbers: [PhoneNumber]
    photo: String
    age: String
    birthDate: String
    birthDay: Int
    birthMonth: Int
    birthYear: Int
    email: String
    impersonationParameter: String
    campus(cache: Boolean = true): Campus
    home(cache: Boolean = true): Location
    roles(cache: Boolean = true): [Group]
    attributes(key: String): [Attribute]
    groups(cache: Boolean = true, groupTypeIds: [Int] = []): [Group]
  }

  type PhoneNumberMutationResponse implements MutationResponse {
    error: String
    success: Boolean!
    code: Int
  }

  type DeviceRegistrationMutationResponse implements MutationResponse {
    error: String
    success: Boolean!
    code: Int
  }

  type AttributeValueMutationResponse implements MutationResponse {
    error: String
    success: Boolean!
    code: Int
  }
`
];
