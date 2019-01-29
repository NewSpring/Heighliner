import { Engine } from "apollo-engine";

const apolloEngine = new Engine({
  engineConfig: {
    apiKey: process.env.ENGINE_API_KEY
  },
  graphqlPort: process.env.PORT
});

if (process.env.NODE_ENV === "production") apolloEngine.start();

export default app => {
  if (process.env.NODE_ENV === "production") {
    app.use(apolloEngine.expressMiddleware());
  }
};
