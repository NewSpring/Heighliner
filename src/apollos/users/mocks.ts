
import { MockList } from "graphql-tools";
import casual from "casual";

export interface HashTypeMocks {
  when(): string
}

export interface UserRockTypeMocks {
  id(): number
  alias(): number
}

export interface UserRockTypeMocks {
  id(): number
  alias(): number
}

export interface UserTypeMocks {
  createdAt(): string
  emails(): [{ address: string }]
}

export interface UserMocks {
  Hashes(): HashTypeMocks
  UserRock(): UserRockTypeMocks
  User(): UserTypeMocks
}

export default {

  Hashes: () => ({
    when: () => (`${new Date(casual.unix_time)}`),
  }),

  UserRock: () => ({
    id: () => casual.integer(0, 10000),
    alias: () => casual.integer(0, 10000),
  }),

  User: () => ({
    createdAt: () => (`${new Date(casual.unix_time)}`),
    emails: () => new MockList(2, () => ({
      address: casual.email,
    })),
  }),

};
