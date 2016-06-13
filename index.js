
var Fs = require("fs"),
      Path = require("path"),
      Env = require("node-env-file");

// load in env variables if they exist
if (process.env.NODE_ENV === "production") {
  if (Fs.existsSync(Path.join(__dirname, "/.env"))) {
    Env(Path.join(__dirname, "/.env"))
  }
} else {
  if (Fs.existsSync(Path.join(__dirname, "/.env.dev"))) {
    Env(Path.join(__dirname, "/.env.dev"))
  }
}

if (process.env.NEW_RELIC_KEY){
  // monitor
  require("newrelic");
}

require("babel-core/register");
require("babel-polyfill");
require("./lib/src/server");


