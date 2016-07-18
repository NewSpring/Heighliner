import test from "ava";
import casual from "casual";

import { SSFetchConnector, connect } from "../../src/google-site-search/fetch";

test("`connect` should fail without any env vars", async (t) => {
  const SS = await connect(casual.url);
  t.falsy(SS);
});

test("`connect` should fail without all env vars", async (t) => {
  process.env.SEARCH_URL = casual.url;
  process.env.SEARCH_KEY = casual.word;

  const SS = await connect(casual.url);
  t.falsy(SS);
});

test("`connect` should return true if proper env vars", async (t) => {
  process.env.SEARCH_URL = casual.url;
  process.env.SEARCH_KEY = casual.word;
  process.env.SEARCH_CX = casual.word;

  const SS = await connect(casual.url);
  t.truthy(SS);
});

test("`SSFetchConnector` should expose get function", async (t) => {
  const testFetcher = new SSFetchConnector();
  t.truthy(testFetcher.get);
});
