// setup apollos endpoint
import mongoose from "mongoose"
import Path from "path"
import Fs from "fs"

let settings = { env: {} }

let settingsDest = Path.join(__dirname, "../.remote/sites/my.newspring.cc/mup.json")
if (Fs.existsSync(settingsDest)) {
  settings = require(settingsDest)
}

mongoose.connect(process.env.MONGO_URL || settings.env.MONGO_URL);

mongoose.connection.on("error", console.error.bind(console, "MONGO connection error:"));

export default mongoose
