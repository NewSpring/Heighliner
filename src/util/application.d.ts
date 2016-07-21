
export interface QueryResolver {
  (rootValue: any, args: any, context: any): any;
}

// export interface Resolver {
//   // Query?: QueryResolver;
//   [key: string]: Resolver;
//   (): Object;
// }

export interface Resolvers {
  [key: string]: any;
}


export interface Models {
  // [key: string]: new(...args: any[]) => any;
  [key: string]: any; // XXX make this better
}

// export interface Mock {
//   [key: string]: any;
//   (): Mock;
// }

export interface Mocks {
  Query?: any;
  [key: string]: any;
}


export interface ApplicationDefinition {
  schema: string[];
  models: Models;
  resolvers: Resolvers;
  mocks?: Mocks;
  connect?: Function;
  queries?: string[];
  mutations?: string[];
}

export interface SchemaShorthand {
  queries?: string[];
  mutations?: string[];
  schema?: string[];
}
