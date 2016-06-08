
export interface Cache {
  get(id: string, lookup?: () => Promise<Object | void>, opts?: { ttl: number, cache: boolean }): Promise<Object | void>
  set(id: string, data: any, ttl: number): Promise<Boolean>
  del(id: string): void;
  encode(obj: Object, prefix?: string): string
}