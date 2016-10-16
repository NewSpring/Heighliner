/*


  Quick typings for not typed projects


*/
declare module "graphql-tools" {
  export class MockList {
    constructor(count: number, method: () => any)
  }
  export function addMockFunctionsToSchema(opts: any): void
  export function makeExecutableSchema(schema: any): any
}

declare module "dataloader" {
  export interface IOptions {
    batch?: boolean;
    cache?: boolean;
    cacheMap?: any;
    cacheKeyFn?(key: string): string;
  }
  export default class Dataloader {
    constructor(method: (keys: string[]) => Promise<any[]>, options?: IOptions);
    public load(id: string | number): any;
  }
}

declare module "optics-agent" {
  export class Optics {
    constructor();
    public instrumentSchema(schema: any): void;
    public middleware(): any;
    public context(request: any): any;
  }

  let optics: Optics;
  export default optics;
}

declare module "casual" {
  function integer(low: number, high: number): number;
  function random_value(any): any;
  export var email: string;
  export var unix_time: string;
  export var word: string;
  export var title: string;
  export var url: string;
  export var description: string;
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

declare module "raven" {
  export interface IOptions {
    extra?: Object;
    tags?: { [key:string]: string };
    fingerprint?: string[];
    level?: string;
  }
  export interface userContext {
    email: string;
    id: string;
  }

  export interface IClient {
    captureError(error: Error | string);
    setUserContext(user: userContext);
    setExtraContext(context: Object);
    setTagsContext(tags: { [key: string]: string });
  }

  export interface IParser {
    parseRequest(req: any, opts?: any): any;
  }

  export var Client: IClient;
  export var parsers: IParser;

  export interface IExpressMiddleware {
    requestHandler(url: string): any;
    errorHandler(url: string): any;
  }
  export interface IMiddleware {
    express: IExpressMiddleware;
  }

  export interface Raven {
    middleware: IMiddleware;
    Client: { new(url: string): IClient };
  }
  let client: Raven;
  export default client;
}

declare module "datadog-metrics" {
  export interface DDog {
    BufferedMetricsLogger: { new(opts?: any): any };
  }
  let client: DDog;
  export default client;
}

declare module "mp3-duration" {
  export default function(filename: string, callback: any);
}
