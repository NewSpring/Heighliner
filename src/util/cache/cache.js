
export abstract class Cache {
  constructor(cache?: any, secret?: string) {
    return;
  };
  public get(
    id: string,
    lookup?: () => Promise<Object | void>,
    opts?: { ttl?: number, cache?: boolean }
  ): Promise<Object | void> { return; }
  public set(id: string, data: any, ttl?: number): Promise<boolean> {
    return Promise.resolve(true);
  }
  public del(id: string): void {
    return;
  };
  public encode(obj: Object, prefix?: string): string { return ""; }
}
