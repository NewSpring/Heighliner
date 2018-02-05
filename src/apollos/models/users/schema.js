
export default [`
  type Hashes {
    when: String!
    hashedToken: ID!
  }

  type UserTokens {
    tokens: [Hashes]
  }

  type UserRock {
    id: Int
    alias: Int
  }

  type UserService {
    rock: UserRock
    resume: UserTokens
  }

  type UserEmail {
    address: String!
    verified: Boolean
  }

  type User implements Node {
    id: ID!
    # We should investigate how best to represent dates
    createdAt: String!
    services: UserService @deprecated(reason: "This is a private server-only field")
    emails: [UserEmail] @deprecated(reason: "Use email instead")
    email: String
    followedTopics: [String]
  }

  type LoginMutationResponse {
    id: ID!
    token: String
  }

  input UserProfileInput {
    NickName: String,
    FirstName: String,
    LastName: String,
    Email: String,
    BirthMonth: String,
    BirthDay: String,
    BirthYear: String,
    Campus: ID,
  }
`];
