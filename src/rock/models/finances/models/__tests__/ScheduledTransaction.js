import ScheduledTransaction from "../ScheduledTransaction";
import { ScheduledTransaction as ScheduledTransactionTable } from "../../tables";
import nmi from "../../util/nmi";

import { createGlobalId } from "../../../../../util/node";

jest.mock("../../tables", () => ({
  ScheduledTransaction: {
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn()
  }
}));

jest.mock("../../util/nmi");

const mockedCache = {
  get: jest.fn((id, lookup) => Promise.resolve().then(lookup)),
  set: jest.fn(() => Promise.resolve().then(() => true)),
  del: jest.fn(),
  encode: jest.fn((obj, prefix) => `${prefix}${JSON.stringify(obj)}`)
};

describe("canceling a schedule", () => {
  it("tries to load the passed id", async () => {
    const id = 1;
    const nodeId = createGlobalId(1, "ScheduledTransaction");
    const Local = new ScheduledTransaction({ cache: mockedCache });
    ScheduledTransactionTable.find.mockReturnValueOnce([]);
    const result = await Local.cancelNMISchedule(1, {});

    expect(ScheduledTransactionTable.findOne).toBeCalledWith({
      where: { Id: id }
    });
    expect(mockedCache.get.mock.calls[0][0]).toEqual(nodeId);
    expect(result).toEqual({ error: "Schedule not found" });
  });

  it("it cancels the schedule in NMI based on the GatewayScheduleId", async () => {
    const id = 1;
    const Local = new ScheduledTransaction({ cache: mockedCache });
    ScheduledTransactionTable.findOne.mockReturnValueOnce({
      Id: id,
      GatewayScheduleId: "10"
    });
    ScheduledTransactionTable.patch.mockReturnValueOnce(
      Promise.resolve({
        status: 200
      })
    );

    nmi.mockReturnValueOnce(Promise.resolve({ success: true }));
    const result = await Local.cancelNMISchedule(1, { SecurityKey: "safe" });

    expect(nmi).toBeCalledWith(
      {
        "delete-subscription": {
          "api-key": "safe",
          "subscription-id": "10"
        }
      },
      { SecurityKey: "safe" }
    );

    expect(result).toEqual({ scheduleId: 1 });
  });

  it("it makes the schedule inActive in rock", async () => {
    const id = 1;
    const Local = new ScheduledTransaction({ cache: mockedCache });
    ScheduledTransactionTable.findOne.mockReturnValueOnce({
      Id: id,
      GatewayScheduleId: "10"
    });
    ScheduledTransactionTable.patch.mockReturnValueOnce(
      Promise.resolve({
        status: 200
      })
    );

    nmi.mockReturnValueOnce(Promise.resolve({ success: true }));
    const result = await Local.cancelNMISchedule(1, { SecurityKey: "safe" });

    expect(ScheduledTransactionTable.patch).toBeCalledWith(1, {
      IsActive: false
    });

    expect(result).toEqual({ scheduleId: 1 });
  });

  it("it deletes an invalid schedule in rock", async () => {
    const id = 1;
    const Local = new ScheduledTransaction({ cache: mockedCache });
    ScheduledTransactionTable.findOne.mockReturnValueOnce({
      Id: id
    });
    ScheduledTransactionTable.delete.mockReturnValueOnce(
      Promise.resolve({
        status: 200
      })
    );

    nmi.mockReturnValueOnce(Promise.resolve({ success: true }));
    const result = await Local.cancelNMISchedule(1, { SecurityKey: "safe" });

    expect(ScheduledTransactionTable.delete).toBeCalledWith(1);

    expect(result).toEqual({ scheduleId: 1 });
  });

  it("it cleans up data in rock if not found in NMI", async () => {
    const id = 1;
    const Local = new ScheduledTransaction({ cache: mockedCache });
    ScheduledTransactionTable.findOne.mockReturnValueOnce({
      Id: id
    });
    ScheduledTransactionTable.delete.mockReturnValueOnce(
      Promise.resolve({
        status: 200
      })
    );

    nmi.mockReturnValueOnce(
      Promise.reject({ message: "Transaction not found" })
    );
    const result = await Local.cancelNMISchedule(1, { SecurityKey: "safe" });

    expect(ScheduledTransactionTable.delete).toBeCalledWith(1);

    expect(result).toEqual({ scheduleId: 1 });
  });

  it("it deletes the cache of the schedule", async () => {
    const id = 1;
    const nodeId = createGlobalId(`${1}`, "ScheduledTransaction");
    const Local = new ScheduledTransaction({ cache: mockedCache });
    ScheduledTransactionTable.findOne.mockReturnValueOnce({
      Id: id
    });
    ScheduledTransactionTable.delete.mockReturnValueOnce(
      Promise.resolve({
        status: 200
      })
    );

    nmi.mockReturnValueOnce(
      Promise.reject({ message: "No recurring subscriptions found" })
    );
    const result = await Local.cancelNMISchedule(1, { SecurityKey: "safe" });

    expect(ScheduledTransactionTable.delete).toBeCalledWith(1);
    expect(mockedCache.del).toBeCalledWith(nodeId);

    expect(result).toEqual({ scheduleId: 1 });
  });

  it("it correctly passes errors from NMI", async () => {
    const id = 1;
    const Local = new ScheduledTransaction({ cache: mockedCache });
    ScheduledTransactionTable.delete.mockClear();
    ScheduledTransactionTable.findOne.mockReturnValueOnce({
      Id: id
    });

    const error = new Error("System offline");
    error.code = 500;
    nmi.mockReturnValueOnce(Promise.reject(error));
    const result = await Local.cancelNMISchedule(1, { SecurityKey: "safe" });

    expect(ScheduledTransactionTable.delete).not.toBeCalled();

    expect(result).toEqual({ error: "System offline", code: 500 });
  });
});
