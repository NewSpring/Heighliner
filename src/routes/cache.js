import { createModels } from "./graphql";
import { createCache } from "../util/cache";

export default (app, monitor) => {
  app.post("/util/cache/flush", async (req, res) => {
    const cache = await createCache(monitor);
    cache.clearAll();
    res.end();
  });

  app.post("/graphql/cache", async (req, res) => {
    const cache = await createCache(monitor);
    const models = createModels({ cache });

    const { type, id } = req.body;
    if (!type || !id) {
      res.status(500).send({ error: "Missing `id` or `type` for request" });
      return;
    }
    let clearingCache;
    for (const model in models) {
      const Model = models[model];
      if (!Model.cacheTypes) continue;
      if (Model.cacheTypes.indexOf(type) === -1) continue;
      clearingCache = true;
      // XXX should we hold off the res until this responds?
      Model.clearCacheFromRequest(req);
    }
    if (!clearingCache) {
      res.status(404).send({ error: `No model found for ${type}` });
      return;
    }

    res.status(200).send({ message: `Cache cleared for ${type} ${id}` });
  });
};
