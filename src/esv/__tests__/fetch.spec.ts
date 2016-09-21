import casual from "casual";

import { ESVFetchConnector, connect } from "../fetch";

it("`connect` should fail without any env vars", async () => {
  delete process.env.ESV_KEY;

  const ESV = await connect();
  expect(ESV).toBeFalsy();
});

it("`connect` should be fine with esv key", async () => {
  process.env.ESV_KEY = casual.word;

  const ESV = await connect();
  expect(ESV).toBeTruthy();
});

it("`ESVFetchConnector` should export getFromAPI function", () => {
  const testFetcher = new ESVFetchConnector();
  expect(testFetcher.getFromAPI).toBeTruthy();
});
