
import { MockList } from "graphql-tools";
import casual from "casual";

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
    emails: () => new MockList(1, () => ({
      address: casual.email,
    }))
  }),

};
