import test from "ava";
import casual from "casual";

import { ESVFetchConnector, connect } from "../../src/esv/fetch";

test("`connect` should fail without any env vars", async (t) => {
  delete process.env.ESV_KEY;

  const ESV = await connect();
  t.falsy(ESV);
});

test("`connect` should be fine with esv key", async (t) => {
  process.env.ESV_KEY = casual.word;

  const ESV = await connect();
  t.truthy(ESV);
});

test("`ESVFetchConnector` should export getFromAPI function", t => {
  const testFetcher = new ESVFetchConnector();
  t.truthy(testFetcher.getFromAPI);
});
