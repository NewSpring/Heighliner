
import SavedPayment from "../SavedPayment";
import { SavedPayment as SavedPaymentTable } from "../../tables";
import nmi from "../../util/nmi";

import { createGlobalId } from "../../../../../util/node";

jest.mock("../../tables", () => ({
  SavedPayment: {
    find: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("../../util/nmi");

const mockedCache = {
  get: jest.fn((id, lookup) => Promise.resolve().then(lookup)),
  set: jest.fn(() => Promise.resolve().then(() => true)),
  del() {},
  encode: jest.fn((obj, prefix) => `${prefix}${JSON.stringify(obj)}`),
};

describe("removing a saved payment", () => {
  it("tries to load the passed id", async () => {
    const id = 1;
    const nodeId = createGlobalId(1, "SavedPayment");
    const Local = new SavedPayment({ cache: mockedCache });
    SavedPaymentTable.find.mockReturnValueOnce([]);
    const result = await Local.removeFromEntityId(1, {});

    expect(SavedPaymentTable.find).toBeCalledWith({ where: { Id: id } });
    expect(mockedCache.get.mock.calls[0][0]).toEqual(nodeId);
    expect(result).toEqual({ error: "No saved account found" });
  });

  it("tries to delete the loaded id from rock", async () => {
    const id = 1;
    const Local = new SavedPayment({ cache: mockedCache });
    SavedPaymentTable.find.mockReturnValueOnce([{ Id: id }]);
    SavedPaymentTable.delete.mockReturnValueOnce(Promise.resolve({
      status: 504,
    }));
    const result = await Local.removeFromEntityId(1, {});

    expect(SavedPaymentTable.delete).toBeCalledWith(id);
    expect(result).toEqual({ status: 504, Id: 1 });
  });

  it("doesn't try to delete the payment in NMI if response is missing a code", async () => {
    const id = 1;
    const Local = new SavedPayment({ cache: mockedCache });
    SavedPaymentTable.find.mockReturnValueOnce([{ Id: id }]);
    SavedPaymentTable.delete.mockReturnValueOnce(Promise.resolve({
      status: 200,
    }));
    const result = await Local.removeFromEntityId(1, {});

    expect(SavedPaymentTable.delete).toBeCalledWith(id);
    expect(result).toEqual({ status: 200, Id: 1 });
  });

  it("calls the nmi method with the passed security key and the code of the payment", async () => {
    const id = 1;
    const Local = new SavedPayment({ cache: mockedCache });
    SavedPaymentTable.find.mockReturnValueOnce([{
      Id: id,
      ReferenceNumber: "10",
    }]);
    SavedPaymentTable.delete.mockReturnValueOnce(Promise.resolve({
      status: 200,
    }));

    nmi.mockReturnValueOnce(Promise.resolve({ success: true }));
    const result = await Local.removeFromEntityId(1, { SecurityKey: "safe" });

    expect(nmi).toBeCalledWith({
      "delete-customer": {
        "api-key": "safe",
        "customer-vault-id": "10",
      },
    }, { SecurityKey: "safe" });

    expect(result).toEqual({ success: true, Id: 1 });
  });

  it("catches errors from NMI and reports it back", async () => {
    const id = 1;
    const Local = new SavedPayment({ cache: mockedCache });
    SavedPaymentTable.find.mockReturnValueOnce([{
      Id: id,
      ReferenceNumber: "10",
    }]);

    SavedPaymentTable.delete.mockReturnValueOnce(Promise.resolve({
      status: 200,
      Id: 1,
    }));

    nmi.mockReturnValueOnce(Promise.reject(new Error("it failed")));
    const result = await Local.removeFromEntityId(1, { SecurityKey: "safe" });
    expect(result).toEqual({ error: "it failed" });
  });
});

describe("charging NMI for a saved payment", () => {
  it("calls the nmi method witha complete-action object", async () => {
    const Local = new SavedPayment({ cache: mockedCache });

    nmi.mockImplementationOnce(() => Promise.resolve({ success: true }));

    const result = await Local.charge("token", { SecurityKey: "safe" });

    expect(nmi).toBeCalledWith({
      "complete-action": {
        "api-key": "safe",
        "token-id": "token",
      },
    }, { SecurityKey: "safe" });

    expect(result).toEqual({ success: true });
  });
});

describe("validate", () => {
  it("throws with a helpful error if no token provided", async () => {
    const Local = new SavedPayment({ cache: mockedCache });
    try {
      await Local.validate({});
      throw new Error("test failure");
    } catch (e) {
      expect(e.message).toMatch(/No token provided/);
    }
  });

  it("calls charge with the needed data", async () => {
    const Local = new SavedPayment({ cache: mockedCache });
    Local.charge = jest.fn(() => Promise.resolve({
      "result-code": "1",
    }));
    const result = await Local.validate({ token: "token" }, { SecurityKey: "foo" });
    expect(result).toEqual({
      code: "1",
      success: true,
      error: null,
    });
    expect(Local.charge).toBeCalledWith("token", { SecurityKey: "foo" });
  });
});

describe("save", () => {
  it("throws if missing a token with a helpful error", async () => {
    const Local = new SavedPayment({ cache: mockedCache });
    try {
      await Local.save({});
      throw new Error("test failure");
    } catch (e) {
      expect(e.message).toMatch(/No token provided/);
    }
  });

  it("throws if missing a person with a helpful error", async () => {
    const Local = new SavedPayment({ cache: mockedCache });
    try {
      await Local.save({ token: "foo" });
      throw new Error("test failure");
    } catch (e) {
      expect(e.message).toMatch(/Must be signed in to save a payment/);
    }
  });

  xit("correctly formats the creation of a saved account");
  xit("correctly formats the creation of a payment details [CC]");
  xit("correctly formats the creation of a payment details [ACH]");
  xit("it clears the cache after success");
});
