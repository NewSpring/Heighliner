import Crypto from "crypto";
const secret = process.env.SECRET || "LZEVhlgzFZKClu1r";

export default class Node {
  constructor(context) {
    this.models = context.models;
  }

  // XXX what do we want to do about errors here?
  async get(encodedId) {
    const { __type, id } = parseGlobalId(encodedId);

    if (
      !this.models || !this.models[__type] || !this.models[__type].getFromId
    ) {
      return Promise.reject(`No model found using ${__type}`);
    }

    try {
      const data = await this.models[__type].getFromId(id, encodedId);
      if (!data) return null;
      data.__type = __type;
      return data;
    } catch (e) {
      return Promise.reject(e.message);
    }
  }
}

export function createGlobalId(id, type) {
  const cipher = Crypto.createCipher("aes192", secret);

  let encrypted = cipher.update(`${type}:${id}`, "utf8", "hex");
  encrypted += cipher.final("hex");

  return encodeURI(encrypted);
}

export function parseGlobalId(encodedId) {
  const decipher = Crypto.createDecipher("aes192", secret);

  let decrypted = decipher.update(decodeURI(encodedId), "hex", "utf8");
  decrypted += decipher.final("utf8");

  const [__type, id] = decrypted.toString().split(":");
  return { __type, id };
}
