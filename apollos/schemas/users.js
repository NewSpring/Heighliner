
import mongo from "./../mongo"

const UserSchema = new mongo.Schema({
  _id : String,
  services: Object
})

const Users = mongo.model("users", UserSchema)

export default Users
