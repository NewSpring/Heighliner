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

if (process.env.GQL_TRACING_TOOL === "engine") apolloEngine.start();

export default (app) => {
  if (process.env.GQL_TRACING_TOOL === "engine") {
    app.use(apolloEngine.expressMiddleware());
  }
};
