// setup apollos endpoint
import mongoose from "mongoose"
import Path from "path"

let settings = require(Path.join(__dirname, "../.remote/sites/my.newspring.cc/mup.json"))

mongoose.connect(settings.env.MONGO_URL);

export default mongoose
