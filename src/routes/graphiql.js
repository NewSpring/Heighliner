import { graphiqlExpress } from "apollo-server";

export default app => {
  if (process.env.SENTRY_ENVIRONMENT !== "production") {
    app.use("/view", graphiqlExpress({ endpointURL: "/graphql" }));
    app.use("/graphql/view", graphiqlExpress({ endpointURL: "/graphql" }));
  }
};
