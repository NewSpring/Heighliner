
import Fs from "fs";
import Path from "path";
import { merge } from "lodash";

Object.defineProperty(global, "__stack", {
  get: function() {
    var orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function(_, stack) {
      return stack;
    };
    var err = new Error;
    var stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack;
  },
});

Object.defineProperty(global, "__file", {
  get: function() {
    return __stack[3].getFileName();
  },
});

export function gql(file) {
  const baseFile = Path.dirname(__file);
  file = Path.resolve(baseFile, `${file}.graphql`);

  let gql = [];
  if (Fs.existsSync(file)) {
    const data = Fs.readFileSync(file, { encoding: "utf8" });
    if (data) {
      gql = [data];
    }
  }

  return gql;
}


export function createQueries(queries) {
  return [`
    type Query {
      ${queries.join("\n")}
    }
  `];
}


export function loadApplications(applications) {

  const joined = {
    schema: [],
    models: {},
    resolvers: {},
    mocks: {},
  };


  Object.keys(applications).forEach((name) => {
    let app = applications[name];
    joined.schema = [...joined.schema, ...app.schema];
    joined.models = merge(joined.models, app.models);
    joined.resolvers = merge(joined.resolvers, app.resolvers);
    joined.mocks = merge(joined.mocks, app.mocks);
  });

  return joined;
}

export function createSchema({ queries, mutations, schema }) {

  // build base level schema
  const Root = [`
    schema {
      query: Query
    }
  `];

  const Query = createQueries(queries);
  // const Mutation = createMutations(mutations);

  // generate the final schema
  return [
    ...Root,
    ...Query,
    ...schema,
  ];

}
