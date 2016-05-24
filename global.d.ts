/*


  Quick typings for not typed projects


*/
declare module "graphql-tools" {
  // XXX actually type this project
  function apolloServer(config: any): any

  export class MockList {
    constructor(count: number, method: () => any): any
  }
}

declare module "casual" {
  export interface Casual {
    integer(low: number, high: number);
    email: string;
    unix_time: string;
  }
}
