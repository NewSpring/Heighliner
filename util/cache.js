// import DataLoader from "dataloader"
import redis from "redis"
import Promise from "bluebird"
import Url from "url"

// local development handling for docker-machine ips being different
let host = "192.168.99.100"
if (process.env.DOCKER_HOST) {
  const hostObj = Url.parse(process.env.DOCKER_HOST)
  host = hostObj.host
}

// host = process.env.REDIS_HOST ? process.env.REDIS_HOST : host;
// const client = redis.createClient(6379, host);


// client.on("error", (err) => {
//   console.log(`REDIS ERROR from ${process.env.REDIS_HOST}:`, err)
//   // stub methods
//   // client.set = () => {}
//   // client.del = () => {}
//   // client.expire = () => {}
//   // client.get = (key, cb) => (cb(null, false))
// })

function hash(str) {
  var hash = 0, i, chr, len;
  if (str.length === 0) return hash;
  for (i = 0, len = str.length; i < len; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  if (process.env.REDIS_NAMESPACE) {
    hash = process.env.REDIS_NAMESPACE + "_" + hash
  }
  return hash;
}


let ttLength = process.env.NODE_ENV === "production" ? 86400 : 30
const load = (key, fetchMethod, ttl = ttLength, cache = true) => new Promise((resolve, reject) => {

  key = hash(key)

  function get(){
    return fetchMethod()
      .then((data) => {
        resolve(data)
        // client.set(key, JSON.stringify(data))
        // ttl = Number(ttl)
        // if (typeof ttl === "number" && !isNaN(ttl)) {
        //   client.expire(key, ttl)
        // }

      })
  }

  get()
  return
  // if (!cache) {
  //   get();
  //   // client.del(key)
  //   return
  // }
  //
  // client.get(key, (err, response) => {
  //   if (err) { return reject(err); }
  //
  //   if (!response) { get(); return }
  //   resolve(JSON.parse(response))
  //   return
  //
  // })


})

export {
  load
}
