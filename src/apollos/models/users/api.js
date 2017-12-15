import fetch from "isomorphic-fetch";

const baseURL = `${process.env.ROCK_URL}api`;
const CONFIG = {
  headers: {
    "Authorization-Token": process.env.ROCK_TOKEN,
    "Content-Type": "application/json",
  },
};

function statusResponseResolver(r = {}) {
  if (r.status === 204) return true;
  if (r.status >= 200 && r.status < 300) {
    return r.json();
  }
  throw new Error(r.statusText);
}

export function get(url, config = {}) {
  return fetch(`${baseURL}${url}`, {
    method: "GET",
    ...CONFIG,
    ...config,
  })
    .then(statusResponseResolver);
}

export function del(url, config = {}) {
  return fetch(`${baseURL}${url}`, {
    method: "DELETE",
    ...CONFIG,
    ...config,
  })
    .then(statusResponseResolver);
}

export function head(url, config = {}) {
  return fetch(`${baseURL}${url}`, {
    method: "HEAD",
    ...CONFIG,
    ...config,
  })
    .then(statusResponseResolver);
}

export function options(url, config = {}) {
  return fetch(`${baseURL}${url}`, {
    method: "OPTIONS",
    ...CONFIG,
    ...config,
  })
    .then(statusResponseResolver);
}

export function post(url, data = {}, config = {}) {
  return fetch(`${baseURL}${url}`, {
    method: "POST",
    ...CONFIG,
    body: JSON.stringify(data),
    ...config,
  })
    .then(statusResponseResolver);
}

export function put(url, data = {}, config = {}) {
  return fetch(`${baseURL}${url}`, {
    method: "PUT",
    ...CONFIG,
    body: JSON.stringify(data),
    ...config,
  })
    .then(statusResponseResolver);
}

export function patch(url, data = {}, config = {}) {
  return fetch(`${baseURL}${url}`, {
    method: "PATCH",
    ...CONFIG,
    body: JSON.stringify(data),
    ...config,
  })
    .then(statusResponseResolver);
}
