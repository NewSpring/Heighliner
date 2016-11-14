
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
    SavedPaymentTable.find.mockReturnValueOnce(null);
    const result = await Local.removeFromNodeId(1, {});

    expect(SavedPaymentTable.find).toBeCalledWith({ where: { Id: id } });
    expect(mockedCache.get.mock.calls[0][0]).toEqual(nodeId);
    expect(result).toEqual({ error: "No saved account found" });
  });

  it("tries to delete the loaded id from rock", async () => {
    const id = 1;
    const Local = new SavedPayment({ cache: mockedCache });
    SavedPaymentTable.find.mockReturnValueOnce({ Id: id });
    SavedPaymentTable.delete.mockReturnValueOnce(Promise.resolve({
      status: 504,
    }));
    const result = await Local.removeFromNodeId(1, {});

    expect(SavedPaymentTable.delete).toBeCalledWith(id);
    expect(result).toEqual({ status: 504 });
  });

  it("doesn't try to delete the payment in NMI if response is missing a code", async () => {
    const id = 1;
    const Local = new SavedPayment({ cache: mockedCache });
    SavedPaymentTable.find.mockReturnValueOnce({ Id: id });
    SavedPaymentTable.delete.mockReturnValueOnce(Promise.resolve({
      status: 200,
    }));
    const result = await Local.removeFromNodeId(1, {});

    expect(SavedPaymentTable.delete).toBeCalledWith(id);
    expect(result).toEqual({ status: 200 });
  });

  it("calls the nmi method with the passed security key and the code of the payment", async () => {
    const id = 1;
    const Local = new SavedPayment({ cache: mockedCache });
    SavedPaymentTable.find.mockReturnValueOnce({
      Id: id,
      ReferenceNumber: "10",
    });
    SavedPaymentTable.delete.mockReturnValueOnce(Promise.resolve({
      status: 200,
    }));

    nmi.mockReturnValueOnce(Promise.resolve({ success: true }));
    const result = await Local.removeFromNodeId(1, { SecurityKey: "safe" });

    expect(nmi).toBeCalledWith({
      "delete-customer": {
        "api-key": "safe",
        "customer-vault-id": "10",
      },
    }, { SecurityKey: "safe" });

    expect(result).toEqual({ success: true });
  });

  it("catches errors from NMI and reports it back", async () => {
    const id = 1;
    const Local = new SavedPayment({ cache: mockedCache });
    SavedPaymentTable.find.mockReturnValueOnce({
      Id: id,
      ReferenceNumber: "10",
    });
    SavedPaymentTable.delete.mockReturnValueOnce(Promise.resolve({
      status: 200,
    }));

    nmi.mockReturnValueOnce(Promise.reject(new Error("it failed")));
    const result = await Local.removeFromNodeId(1, { SecurityKey: "safe" });
    expect(result).toEqual({ error: "it failed" });
  });
});
