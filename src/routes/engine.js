import { Engine } from "apollo-engine";

const apolloEngine = new Engine({
  engineConfig: {
    apiKey: process.env.ENGINE_API_KEY,
  },
  graphqlPort: 8888,
});

apolloEngine.start();

export default (app) => {
  app.use(apolloEngine.expressMiddleware());
};
