// import DataLoader from "dataloader"
import redis from "redis"
import Promise from "bluebird"

// local development handling for docker-machine ips being different
let dockerhost = "192.168.99.100"
if (process.env.DOCKER_HOST) {
  const hostObj = Url.parse(process.env.DOCKER_HOST)
  dockerhost = hostObj.host
}

const client = redis.createClient(6379, dockerhost);

function hash(str) {
  var hash = 0, i, chr, len;
  if (str.length === 0) return hash;
  for (i = 0, len = str.length; i < len; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}


let ttLength = process.env.NODE_ENV === "production" ? 3600 : 30
const load = (key, fetchMethod, ttl = ttLength, cache = true) => new Promise((resolve, reject) => {

  console.log(cache)
  key = hash(key)

  function get(){
    fetchMethod()
      .then((data) => {
        resolve(data)
        client.set(key, JSON.stringify(data))
        client.expire(key, ttl)
      })
  }

  if (!cache) {
    console.log("deleting key: ", key)
    get();
    client.del(key)
    return
  }

  client.get(key, (err, response) => {
    if (err) { return reject(err); }

    if (!response) { get(); return }
    resolve(JSON.parse(response))
    return

  })


})

export {
  load
}
