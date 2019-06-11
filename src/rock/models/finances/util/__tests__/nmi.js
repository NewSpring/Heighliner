import { Builder } from "xml2js";
import fetch from "isomorphic-fetch";

import nmi from "../nmi";
import language from "../language";

jest.useFakeTimers();

jest.mock("isomorphic-fetch", () => jest.fn(() => Promise.resolve()));

it("throws if no gateway info is provied", () => {
  try {
    nmi({ data: "stuff" });
    throw new Error("should not have gotten here");
  } catch (e) {
    expect(e.message).toMatch(/must be called with NMI Gateway object/);
  }
});

it("builds an xml object from the data provided", () => {
  const returnValue = {
    text: jest.fn(
      () => `
      <?xml version="1.0" encoding="UTF-8"?>
      <response>
          <result>1</result>
          <result-text>success</result-text>
          <result-code>100</result-code>
      </response>
    `
    )
  };

  const payload = { TEST: "TEST" };

  const builder = new Builder();
  const xml = builder.buildObject(payload);
  fetch.mockReturnValueOnce(Promise.resolve(returnValue));
  return nmi(payload, { APIUrl: "https://example.com" }).then(x => {
    expect(fetch).toBeCalledWith("https://example.com", {
      method: "POST",
      body: `${xml}`,
      headers: { "Content-Type": "text/xml" }
    });
    expect(x).toEqual({
      result: "1",
      "result-text": "success",
      "result-code": "100"
    });
  });
});

it("fixes broken reponse xml", () => {
  const returnValue = {
    text: jest.fn(
      () => `
      <?xml version="1.0" encoding="UTF-8"?>
      <response>
          <result>1<,/result>
          <result-text>success</result-text>
          <result-code>100</result-code>
      </response>
    `
    )
  };

  const payload = { TEST: "TEST" };

  const builder = new Builder();
  const xml = builder.buildObject(payload);
  fetch.mockReturnValueOnce(Promise.resolve(returnValue));
  return nmi(payload, { APIUrl: "https://example.com" }).then(x => {
    expect(fetch).toBeCalledWith("https://example.com", {
      method: "POST",
      body: `${xml}`,
      headers: { "Content-Type": "text/xml" }
    });
    expect(x).toEqual({
      result: "1",
      "result-text": "success",
      "result-code": "100"
    });
  });
});

it("reads from the error codes in the language file", () => {
  const returnValue = {
    text: jest.fn(
      () => `
      <?xml version="1.0" encoding="UTF-8"?>
      <response>
          <result>1</result>
          <result-text>fail</result-text>
          <result-code>253</result-code>
      </response>
    `
    )
  };

  const payload = { TEST: "TEST" };

  const builder = new Builder();
  const xml = builder.buildObject(payload);
  fetch.mockReturnValueOnce(Promise.resolve(returnValue));
  return nmi(payload, { APIUrl: "https://example.com" }).catch(err => {
    expect(fetch).toBeCalledWith("https://example.com", {
      method: "POST",
      body: `${xml}`,
      headers: { "Content-Type": "text/xml" }
    });
    expect(err.message).toEqual(language[253]);
  });
});

it("correctly readjusts for duplicate transactions", () => {
  const returnValue = {
    text: jest.fn(
      () => `
      <?xml version="1.0" encoding="UTF-8"?>
      <response>
          <result>1</result>
          <result-text>Duplicate Transaction</result-text>
          <result-code>300</result-code>
      </response>
    `
    )
  };

  const payload = { TEST: "TEST" };

  const builder = new Builder();
  const xml = builder.buildObject(payload);
  fetch.mockReturnValueOnce(Promise.resolve(returnValue));
  return nmi(payload, { APIUrl: "https://example.com" }).catch(err => {
    expect(fetch).toBeCalledWith("https://example.com", {
      method: "POST",
      body: `${xml}`,
      headers: { "Content-Type": "text/xml" }
    });
    expect(err.message).toEqual(language[430]);
  });
});

it("reports the error text if the result code doesn't match", () => {
  const returnValue = {
    text: jest.fn(
      () => `
      <?xml version="1.0" encoding="UTF-8"?>
      <response>
          <result>3</result>
          <result-text>Custom Text</result-text>
          <result-code>1000</result-code>
      </response>
    `
    )
  };

  const payload = { TEST: "TEST" };

  const builder = new Builder();
  const xml = builder.buildObject(payload);
  fetch.mockReturnValueOnce(Promise.resolve(returnValue));
  return nmi(payload, { APIUrl: "https://example.com" }).catch(err => {
    expect(fetch).toBeCalledWith("https://example.com", {
      method: "POST",
      body: `${xml}`,
      headers: { "Content-Type": "text/xml" }
    });
    expect(err.message).toEqual("Custom Text");
  });
});

it("errors if request takes longer than a minute", () => {
  const returnValue = {
    text: jest.fn(
      () =>
        new Promise(s => {
          setTimeout(() => {
            s(`
          <?xml version="1.0" encoding="UTF-8"?>
          <response>
              <result>3</result>
              <result-text>Custom Text</result-text>
              <result-code>1000</result-code>
          </response>
        `);
          }, 61000);
          jest.runAllTimers();
        })
    )
  };

  const payload = { TEST: "TEST" };

  const builder = new Builder();
  const xml = builder.buildObject(payload);

  fetch.mockReturnValueOnce(Promise.resolve(returnValue));
  return nmi(payload, { APIUrl: "https://example.com" }).catch(err => {
    expect(fetch).toBeCalledWith("https://example.com", {
      method: "POST",
      body: `${xml}`,
      headers: { "Content-Type": "text/xml" }
    });
    expect(err.message).toMatch(
      /The request to our payment process took longer than expected./
    );
  });
});
