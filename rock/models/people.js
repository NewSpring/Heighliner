
import { api, parseEndpoint } from "../api"

let rootUrl = "People"

const get = id => api.get(`${rootUrl}/${id}`)

export default {
  get
}
