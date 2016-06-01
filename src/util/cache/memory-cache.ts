import { Cache } from "./cache";

export class InMemoryCache implements Cache {
  private cache;
  
  constructor(cache: any = {}){
    // XXX this is really only used for testing purposes
    this.cache = cache;
  }
  
  public get(id, lookup, ttl): Promise<Object | void> {
    let fromCache = false;
    return new Promise((done) => {
      let data = this.cache[id];
      
      if (!data && lookup) {
        return lookup().then(done);
      }

      fromCache = true;
      return done(data);
      
    }).then((data) => {
      
      if (data && !fromCache) {
        // async the save
        process.nextTick(() => {
          this.set(id, data, ttl);
        });
      }
      
      return data;
    });
  }
  
  public set(id, data, ttl = 86400): Promise<Boolean> {
    return new Promise((done) => {
      // XXX this should technically never fail
      try {
        // save to cache
        this.cache[id] = data;
        
        // clear cache
        setTimeout(() => {
          delete this.cache[id];
        }, ttl * 60);
        
        return done(true);
      } catch (e) {
        return done(false);
      }
    });
  }
  
  public del(id: string): void {
    delete this.cache[id];
  }
  
}