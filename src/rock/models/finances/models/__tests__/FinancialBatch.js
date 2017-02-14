import moment from "moment";

import FinancialBatch from "../FinancialBatch";
import { FinancialBatch as FinancialBatchTable } from "../../tables";

import { createGlobalId } from "../../../../../util/node";

jest.mock("../../tables", () => ({
  FinancialBatch: {
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    post: jest.fn(),
  },
}));

jest.mock("../../util/nmi");

jest.mock("moment");

jest.mock("node-uuid", () => ({
  v4: jest.fn(() => "guid"),
}));

const mockedCache = {
  get: jest.fn((id, lookup) => Promise.resolve().then(lookup)),
  set: jest.fn(() => Promise.resolve().then(() => true)),
  del() {
  },
  encode: jest.fn((obj, prefix) => `${prefix}${JSON.stringify(obj)}`),
};

it("sets the __type", () => {
  const Local = new FinancialBatch({ cache: mockedCache });
  expect(Local.__type).toBe("FinancialBatch");
});

describe("getFromId", () => {
  it("tries to load the passed id", async () => {
    const id = 1;
    const localCache = { ...mockedCache };
    localCache.get = jest.fn((guid, cb) => cb());

    const Local = new FinancialBatch({ cache: localCache });
    const nodeId = createGlobalId(1, Local.__type);
    FinancialBatchTable.findOne.mockReturnValueOnce([]);
    const result = await Local.getFromId(1);

    expect(localCache.get.mock.calls[0][0]).toEqual(nodeId);
    expect(FinancialBatchTable.findOne).toBeCalledWith({ where: { Id: id } });
    expect(result).toEqual([]);
  });
});

describe("findOrCreate", () => {
  it("looks up batches based on currencyType and date", async () => {
    const localCache = { ...mockedCache };
    localCache.get = jest.fn((guid, cb) => cb());

    const Local = new FinancialBatch({ cache: localCache });
    FinancialBatchTable.find.mockReturnValueOnce([{ Id: 1 }]);
    const result = await Local.findOrCreate({
      currencyType: "Visa",
      date: "date",
    });

    expect(FinancialBatchTable.find).toBeCalledWith({
      where: {
        Status: 1,
        BatchStartDateTime: { $lte: "date" },
        BatchEndDateTime: { $gt: "date" },
        Name: "Online Giving Visa",
      },
    });
    expect(result).toEqual({ Id: 1 });
  });

  it("looks up batches based on currencyType and date", async () => {
    const localCache = { ...mockedCache };
    localCache.get = jest.fn((guid, cb) => cb());

    const Local = new FinancialBatch({ cache: localCache });
    FinancialBatchTable.find.mockReturnValueOnce([]);

    const toISOString = jest.fn(() => "date");
    const subtract = jest.fn(() => ({ toISOString }));
    const startOf = jest.fn(() => ({ subtract }));
    const endOf = jest.fn(() => ({ subtract }));

    moment.mockReturnValueOnce({ startOf }).mockReturnValueOnce({ endOf });

    FinancialBatchTable.post.mockReturnValueOnce(Promise.resolve({ Id: 1 }));
    FinancialBatchTable.findOne.mockReturnValueOnce({ Id: 1 });
    const result = await Local.findOrCreate({
      currencyType: "Visa",
      date: "date",
    });

    expect(moment).toBeCalledWith("date");
    expect(startOf).toBeCalledWith("day");
    expect(subtract).toBeCalledWith(1, "minute");
    expect(toISOString).toBeCalled();

    expect(moment).toBeCalledWith("date");
    expect(endOf).toBeCalledWith("day");
    expect(subtract).toBeCalledWith(1, "minute");
    expect(toISOString).toBeCalled();

    expect(FinancialBatchTable.post).toBeCalledWith({
      Guid: "guid",
      Name: "Online Giving Visa",
      Status: 1,
      ControlAmount: 0,
      BatchStartDateTime: "date",
      BatchEndDateTime: "date",
    });
    expect(FinancialBatchTable.findOne).toBeCalledWith({
      where: { Id: 1 },
    });
    expect(result).toEqual({ Id: 1 });
  });
});
