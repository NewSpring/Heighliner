"use strict";

// flightplan.js
var plan = require("flightplan"),
    user = "ubuntu",
    site = "heighliner",
    Env = require("node-env-file"),
    Fs = require("fs"),
    Path = require("path");

// load in env variables if they exist
if (Fs.existsSync(Path.join(__dirname, "/.env"))) {
  Env(Path.join(__dirname, "/.env"))
}

plan.target("production", [
  {
    host: process.env.AWS_HOST,
    username: user,
    agent: process.env.SSH_AUTH_SOCK
  }
]);

var tmpDir = site + "-" + new Date().getTime();

// run commands on localhost
plan.local(function(local) {
  local.log("Run build");
  local.exec("npm i");

  local.log("Copy files to remote hosts");
  var filesToCopy = local.exec("git ls-files", {silent: true});

  // rsync files to all the target"s remote hosts
  local.transfer(filesToCopy, "/tmp/" + tmpDir);
});

// run commands on the target"s remote hosts
plan.remote(function(remote) {
  remote.log("Move folder to web root");
  remote.exec("cp -R /tmp/" + tmpDir + " ~");
  remote.rm("-rf /tmp/" + tmpDir);

  remote.log("Install dependencies");
  remote.exec("node -v")
  remote.exec("pm2 -v || npm install -g pm2")
  remote.exec("npm --production --prefix ~/" + tmpDir
                            + " install ~/" + tmpDir);

  remote.log("Setting environment variables");
  var envVars = [
    "NODE_ENV=production",
    "ROCK_URL=" + process.env.ROCK_URL,
    "ROCK_TOKEN=" + process.env.ROCK_TOKEN,
    "REDIS_HOST=" + process.env.REDIS_HOST,
    "MYSQL_HOST=" + process.env.MYSQL_HOST,
    "MYSQL_DB=" + process.env.MYSQL_DB,
    "MYSQL_USER=" + process.env.MYSQL_USER,
    "MYSQL_PASSWORD=" + process.env.MYSQL_PASSWORD,
    "MONGO_URL=" + process.env.MONGO_URL,
    "MYSQL_SSL='" + process.env.MYSQL_SSL + "'",
    "NEW_RELIC_KEY=" + process.env.NEW_RELIC_KEY,
    "MONGO_SSL=true"
  ];

  remote.log("Reload application");
  remote.exec("ln -snf ~/" + tmpDir + " ~/" + site);
  // remote.exec("pm2 stop " + site);
  remote.exec(
    "sudo " + envVars.join(" ") + " pm2 start " + site + " --node-args=\"--harmony\""
  );
});
