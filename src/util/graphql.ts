
import Fs from "fs";
import Path from "path";
import { merge } from "lodash";

import {
  ApplicationDefinition,
  SchemaShorthand,
} from "./application";

// XXX update node error constructor
declare var Error;
declare var __stack;
declare var __file;

Object.defineProperty(global, "__stack", {
  get: function() {
    let orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function(_, stack) {
      return stack;
    };
    const err = new Error;
    const stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack;
  },
});

Object.defineProperty(global, "__file", {
  get: function() {
    return __stack[3].getFileName();
  },
});

export function gql(file: string): [string] {
  const baseFile = Path.dirname(__file);
  file = Path.resolve(baseFile, `${file}.graphql`);

  let gql = [] as [string];
  if (Fs.existsSync(file)) {
    const data = Fs.readFileSync(file, { encoding: "utf8" });
    if (data) {
      gql = [data];
    }
  }

  return gql;
}


export function createQueries(queries: string[]): string[] {
  return [`
    type Query {
      ${queries.join("\n")}
    }
  `];
}


export function loadApplications(applications: { [key: string]: ApplicationDefinition }): ApplicationDefinition {

  const joined = {
    schema: [],
    models: {},
    resolvers: {},
    mocks: {},
  } as ApplicationDefinition;

  Object.keys(applications).forEach((name: string) => {
    let app: ApplicationDefinition = applications[name];
    joined.schema = [...joined.schema, ...app.schema];
    joined.models = merge(joined.models, app.models);
    joined.resolvers = merge(joined.resolvers, app.resolvers);
    joined.mocks = merge(joined.mocks, app.mocks);
  });

  return joined;
}


export function createSchema({ queries, schema }: SchemaShorthand): string[] {

  // build base level schema
  const root = [`
    schema {
      query: Query
    }
  `];

  const query = createQueries(queries);
  // const Mutation = createMutations(mutations);

  // generate the final schema
  return [
    ...root,
    ...query,
    ...schema,
  ];

}
