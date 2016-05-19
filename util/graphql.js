
import Fs from "fs";
import Path from "path";

Object.defineProperty(global, '__stack', {
  get: function() {
    var orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function(_, stack) {
      return stack;
    };
    var err = new Error;
    var stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack;
  }
});

Object.defineProperty(global, '__file', {
  get: function() {
    return __stack[3].getFileName();
  }
});

export function gql(file) {
  const baseFile = Path.dirname(__file);
  file = Path.resolve(baseFile, `${file}.graphql`);

  let gql = []
  if (Fs.existsSync(file)) {
    const data = Fs.readFileSync(file, { encoding: "utf8" });
    if (data) {
      gql = [data]
    }
  }

  return gql;
}
