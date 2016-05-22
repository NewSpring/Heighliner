
import { MockList } from 'graphql-tools';
import casual from 'casual';

export default {

  Hashes: () => ({
    when: () => (`${casual.date()}`),
  }),

  User: () => ({
    createdAt: () => (`${casual.date()}`),
    emails: () => new MockList(1, () => ({
      address: casual.email,
    }))
  }),

}
