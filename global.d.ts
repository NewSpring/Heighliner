/*


  Quick typings for not typed projects


*/
declare module "graphql-tools" {

  export class MockList {
    constructor(count: number, method: () => any)
  }
}

declare module "apollo-server" {
  // XXX actually type this project
  function apolloServer(config: any): any
}

declare module "casual" {
  function integer(low: number, high: number);
  export var email: string;
  export var unix_time: string;
}


declare module "php-unserialize" {
  function unserialize(data: string): any
}