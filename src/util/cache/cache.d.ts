
export interface Cache {
  get(id: string, lookup?: () => Promise<Object | void>, ttl?: number): Promise<Object | void>
  set(id: string, data: any, ttl: number): Promise<Boolean>
  del(id: string): void;
}