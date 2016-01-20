import mongo from "./../mongo"

const LikeSchema = new mongo.Schema({})
const Likes = mongo.model("likes", {})

export default Likes
