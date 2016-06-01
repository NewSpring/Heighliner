
declare function require(name:string);
const Crypto = require("crypto");
const secret = process.env.SECRET || "LZEVhlgzFZKClu1r";

export default class Node {
  private models: Object[]

  constructor(context) {
    this.models = context.models;
  }

  // XXX what do we want to do about errors here?
  public async get(encodedId): Promise<Object> {
    const { __type, id } = parseGlobalId(encodedId);

    const data = await(this.models[__type].getFromId(id));
    data.__type = __type;

    return data;
  }

}

export function createGlobalId(id: string, type: string): string {
  const cipher = Crypto.createCipher("aes192", secret);

  let encrypted = cipher.update(`${type}:${id}`, "utf8", "base64");
  encrypted += cipher.final("base64");

  return encrypted;
}

export function parseGlobalId(encodedId: string): { id: string, __type: string } {

  const decipher = Crypto.createDecipher("aes192", secret);

  let decrypted = decipher.update(encodedId, "base64", "utf8");
  decrypted += decipher.final("utf8");

  const [ __type, id ] = decrypted.toString().split(":");
  return { __type, id };
}
