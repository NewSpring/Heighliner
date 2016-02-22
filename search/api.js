
import Fs from "fs"
import Path from "path"
import _ from "lodash"
import fetch from "isomorphic-fetch"
import { load } from "../util/cache"

let settings = { siteSearch: {} }
let settingsDest = Path.join(__dirname, "../.remote/sites/my.newspring.cc/settings.json")
if (Fs.existsSync(settingsDest)) {
  settings = require(settingsDest)
}

const api = {
  _: {
    baseURL: process.env.SEARCH_URL || settings.siteSearch.searchUrl,
    key: process.env.SEARCH_KEY || settings.siteSearch.key,
    cx: process.env.SEARCH_CX || settings.siteSearch.key
  }
}

api.call = function (method, query, ttl, cache = true) {

  function checkStatus(response) {

    if (response.status >= 200 && response.status < 300) {
      return response
    } else {
      return {
        status: response.status,
        statusText: response.statusText
      }
    }
  }


  if (!this._.key || !this._.cx || !this._.baseURL) {
    throw new Error("Google api credientials are missing")
  }


  const headers = {
    "Content-Type": "application/json"
  }

  const options = {
    method,
    headers,
  }

  const { baseURL, key, cx } = this._
  let endpoint = `${baseURL}key=${key}&cx=${cx}&q=${query}`
  return load(
    endpoint + JSON.stringify(options),
    () => fetch(endpoint, options)
      .then(checkStatus)
      .then((response) => {
        if (response.status === 204) {
          return true
        }

        if (response.json) {
          return response.json()
        }

        return response

      })
      .then((response) => {
        return response
      })
    , ttl, cache)

}


api.get = function () {
  let args
  args = _.values(arguments)
  args.unshift("GET")
  return api.call.apply(this, args)
}

api["delete"] = function () {
  let args
  args = _.values(arguments)
  args.unshift("DELETE")
  return api.call.apply(this, args)
}

api.put = function () {
  let args
  args = _.values(arguments)
  args.unshift("PUT")
  return api.call.apply(this, args)
}

api.post = function () {
  let args
  args = _.values(arguments)
  args.unshift("POST")
  return api.call.apply(this, args)
}

api.patch = function () {
  let args
  args = _.values(arguments)
  args.unshift("PATCH")
  return api.call.apply(this, args)

}

export {
  api,
}
