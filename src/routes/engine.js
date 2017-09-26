import { Engine } from "apollo-engine";

const apolloEngine = new Engine({
  engineConfig: {
    apiKey: process.env.ENGINE_API_KEY,
    logcfg: {
      level: "debug",
    },
  },
  graphqlPort: process.env.PORT,
});

apolloEngine.start();

export default (app) => {
  app.use(apolloEngine.expressMiddleware());
};
