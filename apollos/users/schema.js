export const schema = [`

  type Hashes {
    when: String!
    hashedToken: String!
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

  type User {
    id: String!
    # We should investigate how best to represent dates
    createdAt: String!
    services: UserService
    emails: [UserEmail]
  }

`];

export const resolvers = {

  UserTokens: {
    tokens: ({ loginTokens }) => loginTokens,
  },

  UserRock: {
    id: ({ PersonId }) => PersonId,
    alias: ({ PrimaryAliasId }) => PrimaryAliasId,
  },

  UserService: {
    rock: ({ rock }) => rock,
    resume: ({ resume }) => resume,
  },

  User: {
    id: ({ _id }) => _id,
    services: ({ services }) => services,
    emails: ({ emails }) => emails,
  },

}
