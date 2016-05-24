/*


  Quick typings for not typed projects


*/
declare module "graphql-tools" {
  // XXX actually type this project
  function apolloServer(config: any): any

  export class MockList {
    constructor(count: number, method: () => any)
  }
}

declare module "casual" {
  function integer(low: number, high: number);
  export var email: string;
  export var unix_time: string;
}
