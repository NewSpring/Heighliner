
import { api, parseEndpoint } from "../api"

const get = (id, ttl, cache) => api.get(
  `DefinedValues?$filter=DefinedTypeId eq ${id}`,
  {},
  ttl,
  cache
)

export default {
  get
}
