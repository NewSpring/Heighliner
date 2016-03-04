
const Fs = require("fs"),
      Path = require("path"),
      Env = require("node-env-file"),
      raygun = require("raygun");

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

// if (process.env.RAYGUN) {
//   var raygunClient = new raygun.Client().init({
//     apiKey: process.env.RAYGUN
//   });
// }


function start(){
  require("babel/register");
  require("./server.js");
}
if (process.env.NODE_ENV === "production") {
  var d = require("domain").create();
  d.on("error", function(err){
    console.error(err)
    // if (raygunClient) {
    //   raygunClient.send(err, {}, function () {
    //     // process.exit();
    //   });
    // }

  });

  d.run(function(){
    // by requiring `babel/register`, all of our successive `require`s will be Babel"d
    start()

  });
} else {
  start()
}
