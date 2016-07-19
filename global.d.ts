/*


  Quick typings for not typed projects


*/
declare module "graphql-tools" {
  export class MockList {
    constructor(count: number, method: () => any)
  }
}

declare module "dataloader" {
  export interface IOptions {
    batch?: boolean;
    cache?: boolean;
    cacheKeyFn?(key: string): string;
    cacheMap?: any;
  }
  export default class Dataloader {
    constructor(method: (keys: string[]) => Promise<any[]>, options?: IOptions)
    load(id: string | number): any
  }
}

declare module "apollo-server" {
  // XXX actually type this project
  function apolloServer(config: any): any
}

declare module "casual" {
  function integer(low: number, high: number): number;
  function random_value(any): any;
  function date(): any;
  export var email: string;
  export var unix_time: string;
  export var word: string;
  export var description: string;
  export var url: string;
  export var title: string;
}

declare module "php-unserialize" {
  function unserialize(data: string): any
}

declare module "graphql-tester" {
  function tester(any): any; // XXX type
}

declare module "graphql-tester/lib/main/servers/express" {
  function create(any): any; // XXX type
}

declare module "promise-timeout" {
  function timeout(method: Promise<any>, timeout: number): Promise<any>;
  export var TimeoutError;
}

declare module "mssql-geoparser" {
  function geometry(location: Buffer): any;
  function geography(location: Buffer): any;
}

declare module "geo-from-ip" {
  interface ICode {
    state: string;
    country: string;
    continent: string;
  }
  interface IGeo {
    accuracy_radius: number;
    latitude: number;
    longitude: number;
    metro_code: number;
    time_zone: string;
  }
  interface ILocation {
    code: ICode;
    city: string;
    state: string;
    country: string;
    continent: string;
    postal: string;
    location: IGeo
  }
  function allData(ip: string): ILocation
}

declare module "google-geocoding" {
  function geocode(location: string, callback: any);
}

declare module "striptags" {
  export default function(html: string, allowedTags?: string): string;
}

declare module "truncate" {
  export default function(string: string, length: number): string;
}
