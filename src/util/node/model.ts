
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
  return new Buffer(`${type}:${id}`).toString("base64");
}

export function parseGlobalId(encodedId: string): { id: string, __type: string } {
  const [ __type, id ] = new Buffer(encodedId, "base64").toString().split(":");
  return { __type, id };
}
