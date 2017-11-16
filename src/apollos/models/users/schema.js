
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
    services: UserService
    emails: [UserEmail]
  }

  type AuthorizeUserMutationResponse implements MutationResponse {
    error: String
    success: Boolean!
    code: Int
    id: String
    token: String
  }

  type DeauthorizeUserMutationResponse implements MutationResponse {
    error: String
    success: Boolean!
    code: Int
  }
`];
