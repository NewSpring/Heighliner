
import { api, parseEndpoint } from "../api"

const get = (id, ttl, cache) => api.get(
  `People?$filter=Id eq ${id}&$expand=Photo`,
  {},
  ttl,
  cache
)

export default {
  get
}
