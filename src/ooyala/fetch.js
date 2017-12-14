export function connect() {
  return Promise.resolve(!!process.env.OOYALA_KEY);
}

