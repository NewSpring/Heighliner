
declare function require(name: string);
import * as Crypto from "crypto";
const secret = process.env.SECRET || "LZEVhlgzFZKClu1r";

export default class Node {
  private models: Object[];

  constructor(context) {
    this.models = context.models;
  }

  // XXX what do we want to do about errors here?
  public async get(encodedId): Promise<Object | void> {
    const { __type, id } = parseGlobalId(encodedId);

    if (!this.models || !this.models[__type] || !this.models[__type].getFromId) {
      return Promise.reject(`No model found using ${__type}`);
    }

    try {
      const data = await(this.models[__type].getFromId(id, encodedId));
      data.__type = __type;
      return data;
    } catch (e) {
      return Promise.reject(e.message);
    }

  }

}

export function createGlobalId(id: string, type: string): string {
  const cipher = Crypto.createCipher("aes192", secret);

  let encrypted = cipher.update(`${type}:${id}`, "utf8", "hex");
  encrypted += cipher.final("hex");

  return encodeURI(encrypted);
}

export function parseGlobalId(encodedId: string): { id: string, __type?: string } {

  const decipher = Crypto.createDecipher("aes192", secret);

  let decrypted = decipher.update(decodeURI(encodedId), "hex", "utf8");
  decrypted += decipher.final("utf8");

  const [ __type, id ] = decrypted.toString().split(":");
  return { __type, id };
}
