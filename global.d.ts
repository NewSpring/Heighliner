/*


  Quick typings for not typed projects


*/
declare module "graphql-tools" {
  export class MockList {
    constructor(count: number, method: () => any)
  }
}

declare module "dataloader" {
  export default class Dataloader {
    constructor(method: (keys: string[]) => Promise<any[]>)
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
  export var email: string;
  export var unix_time: string;
  export var word: string;

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
