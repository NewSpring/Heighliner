
import fetch from "isomorphic-fetch";
import { parseString } from "xml2js";

import {
  FinancialGateway,
  SavedPayment,
} from "../../tables";

import {
  AttributeValue,
} from "../../../system/tables";

import Transaction from "../Transaction";
import nmi from "../../util/nmi";

jest.mock("../../util/nmi");

jest.mock("../../tables", () => ({
  FinancialGateway: {
    find: jest.fn(),
  },
  SavedPayment: {
    find: jest.fn(),
    findOne: jest.fn(),
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

const mockedCache = {
  get: jest.fn((id, lookup) => Promise.resolve().then(lookup)),
  set: jest.fn(() => Promise.resolve().then(() => true)),
  del() {},
  encode: jest.fn((obj, prefix) => `${prefix}${JSON.stringify(obj)}`),
};

describe("loadGatewayDetails", () => {
  it("is a callable method", () => {
    const Local = new Transaction({ cache: mockedCache });
    expect(Local.loadGatewayDetails).toBeTruthy();
  });

  it("returns early there is a cached gateway", async () => {
    const Local = new Transaction({ cache: mockedCache });
    Local.gateway = true;
    expect(await Local.loadGatewayDetails()).toBe(true);
  });

  it("throws if no gateway is specified in the call", async () => {
    const Local = new Transaction({ cache: mockedCache });
    try {
      await Local.loadGatewayDetails();
      throw new Error();
    } catch (e) {
      expect(e.message).toMatch(/No gateway specified/);
    }
  });

  it("it finds all known gateways", () => {
    const Local = new Transaction({ cache: mockedCache });
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
    const Local = new Transaction({ cache: mockedCache });
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
    const Local = new Transaction({ cache: mockedCache });
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

describe("createNMITransaction", () => {
  let Local;
  beforeEach(() => {
    Local = new Transaction({ cache: mockedCache });
    Local.gateway = {
      AdminUsername: "1",
      AdminPassword: "2",
      APIUrl: "3",
      QueryUrl: "3",
      SecurityKey: "3",
      Name: "NMI Gateway",
      Id: 1,
    };
  });
  afterEach(() => {
    Local = undefined;
  });

  it("rejects if no data is passed", async () => {
    try {
      await Local.createNMITransaction({ });
      throw new Error("Should not run");
    } catch (e) { expect(e.message).toMatch(/No data provided/); }
  });

  it("loads gateway details for NMI", async () => {
    Local.loadGatewayDetails = jest.fn(() => ({
      AdminUsername: "1",
      AdminPassword: "2",
      APIUrl: "3",
      QueryUrl: "3",
      SecurityKey: "3",
      Name: "NMI Gateway",
      Id: 1,
    }));

    nmi.mockReturnValueOnce(Promise.resolve(true));

    await Local.createNMITransaction({ data: {} });
    expect(Local.loadGatewayDetails).toBeCalledWith("NMI Gateway");
  });

  it("correctly formats the data object", async () => {
    nmi.mockImplementationOnce((...args) => Promise.resolve(...args));

    const data = await Local.createNMITransaction({
      data: { test: true },
      requestUrl: "https://my.newspring.cc/give/now",
      ip: "1",
    });
    const expected = {
      sale: {
        "add-customer": "",
        "api-key": "3",
        "cvv-reject": "P|N|S|U",
        "ip-address": "1",
        "order-description": "Online contribution from Apollos",
        "redirect-url": "https://my.newspring.cc/give/now",
        test: true,
      },
    };
    expect(data.sale["order-id"]).toBeTruthy();
    delete data.sale["order-id"];

    expect(nmi).toBeCalled();
    expect(data).toEqual(expected);
  });

  it("correctly formats a subscription object", async () => {
    nmi.mockImplementationOnce((...args) => Promise.resolve(...args));

    const data = await Local.createNMITransaction({
      data: { "start-date": "01012020" },
      requestUrl: "https://my.newspring.cc/give/now",
      ip: "1",
    });
    const expected = {
      "add-subscription": {
        "api-key": "3",
        "order-description": "Online contribution from Apollos",
        "redirect-url": "https://my.newspring.cc/give/now",
        "start-date": "01012020",
      },
    };
    expect(data["add-subscription"]["order-id"]).toBeTruthy();
    delete data["add-subscription"]["order-id"];

    expect(nmi).toBeCalled();
    expect(data).toEqual(expected);
  });

  it("adds a persons PrimaryAliasId to an order", async () => {
    nmi.mockImplementationOnce((...args) => Promise.resolve(...args));

    const data = await Local.createNMITransaction({
      data: { },
      requestUrl: "https://my.newspring.cc/give/now",
      ip: "1",
    }, { PrimaryAliasId: 10 });

    const expected = {
      sale: {
        "api-key": "3",
        "order-description": "Online contribution from Apollos",
        "redirect-url": "https://my.newspring.cc/give/now",
        "customer-id": 10,
        "cvv-reject": "P|N|S|U",
        "ip-address": "1",
        "add-customer": "",
      },
    };
    expect(data.sale["order-id"]).toBeTruthy();
    delete data.sale["order-id"];

    expect(nmi).toBeCalled();
    expect(data).toEqual(expected);
  });

  it("handles a validation attempt", async () => {
    nmi.mockImplementationOnce((...args) => Promise.resolve(...args));

    const data = await Local.createNMITransaction({
      data: { amount: 0 },
      requestUrl: "https://my.newspring.cc/give/now",
      ip: "1",
    }, { PrimaryAliasId: 10 });

    const expected = {
      validate: {
        "api-key": "3",
        "order-description": "Online contribution from Apollos",
        "redirect-url": "https://my.newspring.cc/give/now",
        "customer-id": 10,
        "cvv-reject": "P|N|S|U",
        "ip-address": "1",
        amount: 0,
      },
    };
    expect(data.validate["order-id"]).toBeTruthy();
    delete data.validate["order-id"];

    expect(nmi).toBeCalled();
    expect(data).toEqual(expected);
  });

  it("attempts to look up a saved account via the id", async () => {
    nmi.mockImplementationOnce((...args) => Promise.resolve(...args));
    SavedPayment.findOne.mockReturnValueOnce(Promise.resolve({
      ReferenceNumber: 100,
    }));
    const data = await Local.createNMITransaction({
      data: { savedAccount: 10 },
      requestUrl: "https://my.newspring.cc/give/now",
      ip: "1",
    }, { PrimaryAliasId: 10 });

    const expected = {
      sale: {
        "api-key": "3",
        "order-description": "Online contribution from Apollos",
        "redirect-url": "https://my.newspring.cc/give/now",
        "customer-vault-id": 100,
        "ip-address": "1",
      },
    };

    expect(data.sale["order-id"]).toBeTruthy();
    delete data.sale["order-id"];

    expect(SavedPayment.findOne).toBeCalledWith({
      where: { Id: 10 },
    });
    expect(nmi).toBeCalled();
    expect(data).toEqual(expected);
  });

  it("resolves successfuly with an error from NMI", async () => {
    nmi.mockImplementationOnce(() => Promise.reject(new Error("nmi failure")));

    const data = await Local.createNMITransaction({
      requestUrl: "https://my.newspring.cc/give/now",
      ip: "1",
      data: {},
    });

    expect(nmi).toBeCalled();
    expect(data).toEqual({ error: "nmi failure" });
  });
});
