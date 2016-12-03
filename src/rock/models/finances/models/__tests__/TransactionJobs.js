
import moment from "moment";
import queue from "bull";

import TransactionJobs from "../TransactionJobs";

import {
  Transaction as TransactionTable,
  SavedPayment,
  TransactionDetail,
  ScheduledTransaction,
  ScheduledTransactionDetail,
  FinancialPaymentDetail as FinancialPaymentDetailTable,
  FinancialAccount,
} from "../../tables";

import {
  DefinedValue,
} from "../../../system/tables";

import {
  Person as PersonTable,
  PersonAlias,
} from "../../../people/tables";

import {
  Campus as CampusTable,
  Location as LocationTable,
} from "../../../campuses/tables";

import {
  Group,
  GroupLocation,
  GroupMember,
} from "../../../groups/tables";

import FinancialBatch from "../FinancialBatch";


// import { createGlobalId } from "../../../../../util/node";

jest.mock("../../tables", () => ({
  // FinancialBatch: {
  //   find: jest.fn(),
  //   findOne: jest.fn(),
  //   delete: jest.fn(),
  //   post: jest.fn(),
  // },
}));

jest.mock("../../util/nmi");

jest.mock("moment");

jest.mock("node-uuid", () => ({
  v4: jest.fn(() => "guid"),
}));

jest.mock("bull", () => jest.fn(() => ({
  process: jest.fn(() => {}),
  add: jest.fn(() => {}),
})));

const mockedCache = {
  get: jest.fn((id, lookup) => Promise.resolve().then(lookup)),
  set: jest.fn(() => Promise.resolve().then(() => true)),
  del() {},
  encode: jest.fn((obj, prefix) => `${prefix}${JSON.stringify(obj)}`),
};

it("starts up a transaction queue", () => {
  expect(queue.mock.calls[0][0]).toEqual("Transaction Receipt");
  expect(queue.mock.calls[0][1]).toBe(6379);
});

describe("add", () => {
  let Local;
  beforeEach(() => {
    Local = new TransactionJobs({ cache: mockedCache });
  });
  afterEach(() => {
    Local = undefined;
  });

  it("passes data to the queue", () => {
    Local.queue = {
      process: jest.fn(),
      add: jest.fn(),
    };

    Local.add({ test: "TEST" });
    expect(Local.queue.add).toBeCalledWith({ test: "TEST" }, {
      removeOnComplete: true,
      attempts: 288,
      backoff: { type: "fixed", delay: 60000 * 5 },
    });
  });
});

describe("getOrCreatePerson", () => {
  let Local;
  beforeEach(() => {
    Local = new TransactionJobs({ cache: mockedCache });
  });
  afterEach(() => {
    Local = undefined;
  });

  it("keeps going if a person exists", async () => {
    const Person = {
      Id: 1,
    };

    const data = await Local.getOrCreatePerson({ Person });
    expect(data).toEqual({ Person });
  });
});
