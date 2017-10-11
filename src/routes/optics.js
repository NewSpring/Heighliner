import OpticsAgent from "optics-agent";

OpticsAgent.configureAgent({ apiKey: process.env.OPTICS_API_KEY });

export default (app) => {
  if (process.env.OPTICS_API_KEY) app.use("/graphql", OpticsAgent.middleware());
};
