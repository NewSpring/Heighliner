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
    impersonationParameter(expireDateTime: String, pageId: Int, usageLimit: Int): String
    campus(cache: Boolean = false): Campus
    home(cache: Boolean = false): Location
    roles(cache: Boolean = false): [Group]
    attributes(key: String): [Attribute]
    groups(cache: Boolean = false, groupTypeIds: [Int] = []): [Group]
    followedTopics: [String]
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
`,
];
