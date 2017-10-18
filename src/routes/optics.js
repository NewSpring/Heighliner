import OpticsAgent from "optics-agent";

if (process.env.GQL_TRACING_TOOL === "optics") OpticsAgent.configureAgent({ apiKey: process.env.OPTICS_API_KEY });

export default (app) => {
  if (process.env.OPTICS_API_KEY && process.env.GQL_TRACING_TOOL === "optics") {
    app.use("/graphql", OpticsAgent.middleware());
  }
};
