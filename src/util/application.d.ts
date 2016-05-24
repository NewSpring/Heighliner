
export interface QueryResolver {
  (rootValue: any, args: any, context: any): any;
}

export interface Resolver {
  Query?: QueryResolver;
  // [key: string]?: Resolver;
  (): Object;
}

export interface Resolvers {
  [key: string]: Resolver;
}


export interface Models {
  [key: string]: new(...args: any[]) => any;
}

export interface Mock {
  [key: string]: any;
  (): Mock;
}

export interface Mocks {
  [key: string]: Mock;
}


export interface ApplicationDefinition {
  schema: string[];
  models: Models;
  resolvers: Resolvers;
  mocks: Mocks;
}

export interface SchemaShorthand {
  queries?: string[];
  mutations?: string[];
  schema?: string[];
}
