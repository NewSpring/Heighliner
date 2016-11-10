
import casual from "casual";

import { createGlobalId } from "../../../util/node/model";

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