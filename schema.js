
import { schema as Apollos } from "./apollos";

const Root = [`
  type Query {
    currentUser: User
  }

  schema {
    query: Query
  }
`];

export default [
  ...Root,
  ...Apollos,
];
