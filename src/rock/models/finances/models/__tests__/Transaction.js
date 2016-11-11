
import fetch from "isomorphic-fetch";

import {
  FinancialGateway,
} from "../../tables";

import {
  AttributeValue,
} from "../../../system/tables";

import { parseString } from "xml2js";

import Transaction from "../Transaction";

jest.mock("../../tables", () => ({
  FinancialGateway: {
    find: jest.fn(),
  },
}));

jest.mock("../../../system/tables", () => ({
  AttributeValue: {
    find: jest.fn(() => Promise.resolve()),
  },
  Attribute: {
    model: "Attribue",
  },
}));

jest.mock("xml2js", () => ({
  parseString: jest.fn((xml, opts, callback) => {
    callback(null, {});
  }),
}));

jest.mock("isomorphic-fetch", () => jest.fn(() => Promise.resolve()));

describe("loadGatewayDetails", () => {
  it("is a callable method", () => {
    const Local = new Transaction();
    expect(Local.loadGatewayDetails).toBeTruthy();
  });

  it("returns early there is a cached gateway", async () => {
    const Local = new Transaction();
    Local.gateway = true;
    expect(await Local.loadGatewayDetails()).toBe(true);
  });

  it("throws if no gateway is specified in the call", async () => {
    const Local = new Transaction();
    try {
      await Local.loadGatewayDetails();
      throw new Error();
    } catch (e) {
      expect(e.message).toMatch(/No gateway specified/);
    }
  });

  it("it finds all known gateways", () => {
    const Local = new Transaction();
    FinancialGateway.find.mockReturnValueOnce([{ Name: "NMI" }]);
    return Local.loadGatewayDetails("NMI Gateway")
      .then(() => {
        throw new Error("uh oh");
      })
      .catch(({ message }) => {
        expect(message).toMatch(/No gateway found for NMI Gateway/);
        expect(FinancialGateway.find).toBeCalled();
      });
  });

  it("find the attributes for the found gatweway", () => {
    const Local = new Transaction();
    FinancialGateway.find.mockReturnValueOnce([{
      Name: "NMI Gateway",
      Id: 1,
    }]);
    AttributeValue.find.mockReturnValueOnce(Promise.resolve([
      { Value: "1", Attribute: { Key: "AdminUsername" } },
      { Value: "2", Attribute: { Key: "AdminPassword" } },
      { Value: "3", Attribute: { Key: "APIUrl" } },
      { Value: "3", Attribute: { Key: "QueryUrl" } },
      { Value: "3", Attribute: { Key: "SecurityKey" } },
    ]));
    return Local.loadGatewayDetails("NMI Gateway")
      .then(() => {
        expect(FinancialGateway.find).toBeCalled();
        expect(AttributeValue.find.mock.calls[0]).toMatchSnapshot();
        expect(Local.gateway).toEqual({
          AdminUsername: "1",
          AdminPassword: "2",
          APIUrl: "3",
          QueryUrl: "3",
          SecurityKey: "3",
          Name: "NMI Gateway",
          Id: 1,
        });
      });
  });
});

describe("syncTransactions", () => {
  it("correctly makes a call to NMI", () => {
    const Local = new Transaction();
    (Local).gateway = {
      AdminUsername: "1",
      AdminPassword: "2",
      APIUrl: "3",
      QueryUrl: "3",
      SecurityKey: "3",
      Name: "NMI Gateway",
      Id: 1,
    };

    fetch.mockReturnValueOnce(Promise.resolve({
      text: () => Promise.resolve("<xml>"),
    }));

    return Local.syncTransactions({
      gateway: "NMI Gateway",
      transaction_code: "4",
    })
      .then((response) => {
        expect(response).toEqual([]);
        expect(fetch).toBeCalledWith(
          "3?username=1&password=2&transaction_code=4", { method: "POST" },
        );
        expect((parseString).mock.calls[0][0]).toEqual("<xml>");
      });
  });
});
