import OpticsAgent from "optics-agent";

export default (app) => {
  if (process.env.OPTICS_API_KEY) app.use("/graphql", OpticsAgent.middleware());
};
