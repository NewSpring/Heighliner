
import casual from "casual";

import { createGlobalId } from "../../../util/node/model";

export interface HashTypeMocks {
  when(): string;
}

export interface UserRockTypeMocks {
  id(): number;
  alias(): number;
}

export interface UserRockTypeMocks {
  id(): number;
  alias(): number;
}

export interface UserTypeMocks {
  createdAt(): string;
  emails(): [{ address: string }];
}

export interface UserMocks {
  Hashes(): HashTypeMocks;
  UserRock(): UserRockTypeMocks;
  User(): UserTypeMocks;
}

export default {

  Query: {
    currentUser() { return {}; },
  },

  Hashes: () => ({
    when: () => (`${new Date(casual.unix_time)}`),
  }),

  UserRock: () => ({
    id: () => casual.integer(0, 10000),
    alias: () => casual.integer(0, 10000),
  }),

  User: () => ({
    id: () => createGlobalId(`${casual.integer(0, 1000)}`, "User"),
    createdAt: () => (`${new Date(casual.unix_time)}`),
    emails: () => ([{
      address: casual.email,
    }]),
  }),

};
