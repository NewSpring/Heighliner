
import * as Fs from "fs";
import * as Path from "path";

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
