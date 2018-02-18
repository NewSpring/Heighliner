/* eslint-disable */

import casual from "casual";

import { ESVFetchConnector, connect } from "../fetch";

describe("ESV", () => {
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

  it("`ESVFetchConnector` should format the query", () => {
    process.env.ESV_KEY = "test-key";

    const testFetcher = new ESVFetchConnector();
    expect(testFetcher.getRequest("john 3:16")).toMatchSnapshot();
  });

  it("`ESVFetchConnector` should keep track of connectors", () => {
    const testFetcher = new ESVFetchConnector();
    expect(testFetcher.getCount()).toEqual(1);
    expect(testFetcher.getCount()).toEqual(2);
  });
});
