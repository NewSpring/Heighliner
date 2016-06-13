
export abstract class Cache {
  constructor(cache?: any, secret?: string){};
  get(
    id: string,
    lookup?: () => Promise<Object | void>,
    opts?: { ttl?: number, cache?: boolean }
  ): Promise<Object | void> { return; }
  set(id: string, data: any, ttl?: number): Promise<boolean> { return Promise.resolve(true); }
  del(id: string): void {};
  encode(obj: Object, prefix?: string): string { return ''; }
}