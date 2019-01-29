import queue from "bull";

import TransactionJobs, { readIdsFromFrequencies } from "../TransactionJobs";

import {
  Transaction as TransactionTable,
  SavedPayment,
  TransactionDetail,
  ScheduledTransaction,
  ScheduledTransactionDetail,
  FinancialPaymentDetail as FinancialPaymentDetailTable,
  FinancialAccount,
  FinancialBatch as FinancialBatchTable
} from "../../tables";

import { DefinedValue } from "../../../system/tables";

import { Person as PersonTable, PersonAlias } from "../../../people/tables";

import {
  Campus as CampusTable,
  Location as LocationTable
} from "../../../campuses/tables";

import { Group, GroupLocation, GroupMember } from "../../../groups/tables";

// import { createGlobalId } from "../../../../../util/node";

jest.mock("../../tables", () => ({
  FinancialPaymentDetail: {
    model: "FinancialPaymentDetailModel",
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    post: jest.fn()
  },
  Transaction: {
    model: "TransactionModel",
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    post: jest.fn()
  },
  TransactionDetail: {
    model: "TransactionDetailModel",
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    post: jest.fn()
  },
  ScheduledTransaction: {
    model: "ScheduledTransactionModel",
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    post: jest.fn(),
    patch: jest.fn()
  },
  ScheduledTransactionDetail: {
    model: "ScheduledTransactionDetailModel",
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    post: jest.fn(),
    patch: jest.fn()
  },
  SavedPayment: {
    model: "SavedPaymentModel",
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    post: jest.fn(),
    patch: jest.fn()
  },
  FinancialAccount: {
    model: "FinancialAccountModel",
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    post: jest.fn(),
    patch: jest.fn()
  },
  FinancialBatch: {
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    post: jest.fn(),
    patch: jest.fn()
  }
}));

jest.mock("../../../campuses/tables", () => ({
  Location: {
    model: "LocationModel",
    findOne: jest.fn(),
    post: jest.fn(),
    find: jest.fn()
  },
  Campus: {
    model: "CampusModel",
    findOne: jest.fn(),
    post: jest.fn(),
    find: jest.fn()
  }
}));

jest.mock("../../../people/tables", () => ({
  Person: {
    model: "PersonModel",
    findOne: jest.fn(),
    post: jest.fn(),
    find: jest.fn()
  },
  PersonAlias: {
    model: "PersonAliasModel",
    findOne: jest.fn(),
    post: jest.fn(),
    find: jest.fn()
  }
}));

jest.mock("../../../system/tables", () => ({
  DefinedValue: {
    model: "DefinedValueModel",
    findOne: jest.fn(),
    post: jest.fn(),
    find: jest.fn()
  }
}));

jest.mock("../../../groups/tables", () => ({
  Group: {
    model: "GroupModel",
    findOne: jest.fn(),
    post: jest.fn(),
    find: jest.fn()
  },
  GroupLocation: {
    model: "GroupLocationModel",
    findOne: jest.fn(),
    post: jest.fn(),
    find: jest.fn()
  },
  GroupMember: {
    model: "GroupMemberModel",
    findOne: jest.fn(),
    post: jest.fn(),
    find: jest.fn()
  }
}));

jest.mock("../../util/nmi");

jest.mock("moment");

jest.mock("node-uuid", () => ({
  v4: jest.fn(() => "guid")
}));

const mockedCache = {
  get: jest.fn((id, lookup) => Promise.resolve().then(lookup)),
  set: jest.fn(() => Promise.resolve().then(() => true)),
  del() {},
  encode: jest.fn((obj, prefix) => `${prefix}${JSON.stringify(obj)}`)
};

describe("readIdsFromFrequencies", () => {
  const frequencies = [
    { Value: "Weekly", Id: 7 },
    { Value: "Bi-Weekly", Id: 8 },
    { Value: "Twice a Month", Id: 9 },
    { Value: "Monthly", Id: 10 },
    { Value: "One-Time", Id: 11 }
  ];
  it("parses for Weekly", () => {
    const plan = { "day-frequency": "7" };
    expect(readIdsFromFrequencies(plan, frequencies)).toBe(7);
  });
  it("parses for BiWeekly", () => {
    const plan = { "day-frequency": "14" };
    expect(readIdsFromFrequencies(plan, frequencies)).toBe(8);
  });
  it("parses for Twice A Month", () => {
    const plan = { "month-frequency": "2" };
    expect(readIdsFromFrequencies(plan, frequencies)).toBe(9);
  });
  it("parses for Monthly", () => {
    const plan = { "month-frequency": "1" };
    expect(readIdsFromFrequencies(plan, frequencies)).toBe(10);
  });
  it("parses for one time", () => {
    const plan = { "day-of-month": "1" };
    expect(readIdsFromFrequencies(plan, frequencies)).toBe(11);
  });
  it("returns null if nothing found", () => {
    const plan = { "month-frequency": "3" };
    expect(readIdsFromFrequencies(plan, frequencies)).toBe(null);
  });
});

it("starts up a transaction queue", () => {
  expect(queue.mock.calls[0][0]).toEqual("Transaction Receipt");
  expect(queue.mock.calls[0][1]).toBe(6379);
});

describe("batch process", () => {
  it("correctly orders the functions to be called", async () => {
    const Local = new TransactionJobs({ cache: mockedCache });
    const batch = Local.queue.process.mock.calls[0][0];

    Local.getOrCreatePerson = jest.fn();
    Local.createPaymentDetail = jest.fn();
    Local.findOrCreateTransaction = jest.fn();
    Local.findOrCreateSchedule = jest.fn();
    Local.createTransactionDetails = jest.fn();
    // Local.createSavedPayment = jest.fn();
    Local.updateBillingAddress = jest.fn();
    Local.updateBatchControlAmount = jest.fn();
    Local.sendGivingEmail = jest.fn();

    await batch({ data: true });

    expect(Local.getOrCreatePerson).toBeCalled();
    expect(Local.createPaymentDetail).toBeCalled();
    expect(Local.findOrCreateTransaction).toBeCalled();
    expect(Local.findOrCreateSchedule).toBeCalled();
    expect(Local.createTransactionDetails).toBeCalled();
    // expect(Local.createSavedPayment).toBeCalled();
    expect(Local.updateBillingAddress).toBeCalled();
    expect(Local.updateBatchControlAmount).toBeCalled();
    expect(Local.sendGivingEmail).toBeCalled();
  });
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
      on: jest.fn()
    };

    Local.add({ test: "TEST" });
    expect(Local.queue.add).toBeCalledWith(
      { test: "TEST" },
      {
        removeOnComplete: true,
        attempts: 288,
        backoff: { type: "fixed", delay: 60000 * 5 }
      }
    );
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
      Id: 1
    };
    const data = await Local.getOrCreatePerson({ Person });
    expect(data).toEqual({ Person });
  });

  it("keeps going if a person exists in the db", async () => {
    const Person = {
      Guid: "guid"
    };

    PersonTable.findOne.mockReturnValueOnce(
      Promise.resolve({
        FirstName: "James"
      })
    );

    const data = await Local.getOrCreatePerson({ Person });
    expect(PersonTable.findOne).toBeCalledWith({ where: { Guid: "guid" } });
    expect(data).toEqual({ Person: { FirstName: "James" } });
  });

  it("creates a person then pulls that data from Rock", async () => {
    const Person = {
      FirstName: "James",
      Guid: "guid"
    };
    PersonTable.findOne.mockReturnValueOnce(Promise.resolve());
    PersonTable.post.mockReturnValueOnce(1);
    PersonTable.findOne.mockReturnValueOnce(
      Promise.resolve({
        FirstName: "James",
        Guid: "guid",
        PersonAlias: {
          Id: 2
        }
      })
    );
    const data = await Local.getOrCreatePerson({ Person });

    expect(PersonTable.findOne).toBeCalledWith({ where: { Guid: "guid" } });
    expect(PersonTable.post).toBeCalledWith({
      FirstName: "James",
      Guid: "guid"
    });
    expect(PersonTable.findOne).toBeCalledWith({
      where: { Id: 1 },
      include: [{ model: PersonAlias.model }]
    });
    expect(data).toEqual({
      Person: {
        FirstName: "James",
        Guid: "guid",
        PersonAlias: {
          Id: 2
        },
        PrimaryAliasId: 2
      }
    });
  });
});

describe("updateBillingAddress", () => {
  let Local;
  beforeEach(() => {
    Local = new TransactionJobs({ cache: mockedCache });
  });
  afterEach(() => {
    Local = undefined;
  });

  it("keeps going if a Location exists", async () => {
    const Location = {
      Id: 1
    };
    const data = await Local.updateBillingAddress({ Location });
    expect(data).toEqual({ Location });
  });

  it("attempts to find address on file which match the Street1", async () => {
    const Location = {
      Street1: "1 Linwa Blvd"
    };
    const Person = { Id: 1 };

    GroupLocation.find.mockReturnValueOnce(Promise.resolve([]));
    const data = await Local.updateBillingAddress({
      GroupId: 1, // family already found,
      GroupLocationId: 10,
      Location,
      Person
    });

    expect(data).toEqual({
      Location: { Street1: "1 Linwa Blvd" },
      GroupLocationId: 10,
      GroupId: 1,
      Person
    });
  });

  it("looks up the family Id if it hasn't been found yet", async () => {
    const Location = {
      Street1: "1 Linwa Blvd"
    };
    const Person = { Id: 1 };

    GroupLocation.find.mockReturnValueOnce(Promise.resolve([]));
    Group.findOne.mockReturnValueOnce(Promise.resolve({ Id: 12 }));

    const data = await Local.updateBillingAddress({
      GroupLocationId: 11,
      Location,
      Person
    });

    expect(data).toEqual({
      GroupId: 12,
      GroupLocationId: 11,
      Location: { Street1: "1 Linwa Blvd" },
      Person
    });
  });

  it("creates a location and group location if not present", async () => {
    const Location = {
      Street1: "1 Linwa Blvd"
    };
    const Person = { Id: 1 };

    GroupLocation.find.mockReturnValueOnce(Promise.resolve([]));
    LocationTable.post.mockReturnValueOnce(Promise.resolve(10));
    GroupLocation.post.mockReturnValueOnce(Promise.resolve(13));

    const data = await Local.updateBillingAddress({
      GroupId: 11,
      Location,
      Person
    });

    // XXX not sure why, but the mocked call always includes the Id?
    expect(LocationTable.post.mock.calls[0][0].Street1).toBe(Location.Street1);
    expect(LocationTable.post.mock.calls[0][0].Guid).toBe("guid");

    expect(GroupLocation.post).toBeCalledWith({
      GroupId: 11,
      Order: 0,
      LocationId: 10,
      GroupLocationTypeValueId: 804,
      IsMailingLocation: true,
      Guid: "guid"
    });

    expect(data).toEqual({
      GroupId: 11,
      GroupLocationId: 13,
      Location: {
        Street1: "1 Linwa Blvd",
        Guid: "guid",
        Id: 10
      },
      Person
    });
  });
});

describe("createPaymentDetail", () => {
  let Local;
  beforeEach(() => {
    Local = new TransactionJobs({ cache: mockedCache });
  });
  afterEach(() => {
    Local = undefined;
  });

  it("keeps going if a FinancialPaymentDetail exists", async () => {
    const FinancialPaymentDetail = {
      Id: 1
    };
    const data = await Local.createPaymentDetail({ FinancialPaymentDetail });
    expect(data).toEqual({ FinancialPaymentDetail });
  });

  it("creates a payment detail and returns the id", async () => {
    const FinancialPaymentDetail = {};

    FinancialPaymentDetailTable.post.mockReturnValueOnce(Promise.resolve(1));

    const data = await Local.createPaymentDetail({ FinancialPaymentDetail });

    expect(FinancialPaymentDetailTable.post).toBeCalledWith({
      Id: 1,
      Guid: "guid"
    });
    expect(data).toEqual({ FinancialPaymentDetail: { Id: 1, Guid: "guid" } });
  });
});

describe("findOrCreateTransaction", () => {
  const IOS_SOURCE_TYPE = 1121;
  const WEB_SOURCE_TYPE = 1120;
  let Local;
  beforeEach(() => {
    Local = new TransactionJobs({ cache: mockedCache });
  });
  afterEach(() => {
    Local = undefined;
  });

  it("keeps going if a there isn't a TransactionCode (a schedule)", async () => {
    const Transaction = {};
    const data = await Local.findOrCreateTransaction({ Transaction });
    expect(data).toEqual({ Transaction });
  });

  it("keeps going if a Transaction.Id is present", async () => {
    const Transaction = { Id: 1 };
    const data = await Local.findOrCreateTransaction({ Transaction });
    expect(data).toEqual({ Transaction });
  });

  it("avoids creating a duplicate transaction", async () => {
    const Transaction = { TransactionCode: "code" };

    TransactionTable.find.mockReturnValueOnce(Promise.resolve([{ Id: 10 }]));
    const data = await Local.findOrCreateTransaction({ Transaction });

    expect(TransactionTable.find).toBeCalledWith({
      where: { TransactionCode: "code" }
    });
    expect(data).toEqual({ Transaction: { Id: 10, TransactionCode: "code" } });
  });

  it("creates a batch and creates a transaction", async () => {
    Local.FinancialBatch.findOrCreate = jest.fn();

    const Transaction = {
      TransactionCode: "code",
      TransactionDateTime: "now"
    };
    const SourceTypeValue = {
      Url: "example.com"
    };
    const Person = {
      PrimaryAliasId: 10,
      Id: 1
    };
    const FinancialPaymentDetail = {
      Id: 45
    };
    const FinancialPaymentValue = "Visa";

    TransactionTable.find.mockReturnValueOnce(Promise.resolve([]));
    Local.FinancialBatch.findOrCreate.mockReturnValueOnce(
      Promise.resolve({ Id: 30 })
    );
    TransactionTable.post.mockReturnValueOnce(Promise.resolve(20));

    const data = await Local.findOrCreateTransaction({
      Transaction,
      SourceTypeValue,
      Person,
      FinancialPaymentValue,
      FinancialPaymentDetail,
      platform: "web"
    });

    expect(Local.FinancialBatch.findOrCreate).toBeCalledWith({
      currencyType: FinancialPaymentValue,
      date: Transaction.TransactionDateTime
    });

    // XXX for some reason, post methods are including the Id when mocked?
    const capturedMock = TransactionTable.post.mock.calls[0][0];
    delete capturedMock.Id;
    expect(capturedMock).toEqual({
      TransactionCode: "code",
      TransactionDateTime: "now",
      AuthorizedPersonAliasId: 10,
      CreatedByPersonAliasId: 10,
      ModifiedByPersonAliasId: 10,
      BatchId: 30,
      SourceTypeValueId: WEB_SOURCE_TYPE,
      FinancialPaymentDetailId: 45,
      ForeignKey: null
    });
    expect(data).toEqual({
      Transaction: capturedMock,
      SourceTypeValue,
      Person,
      FinancialPaymentValue,
      FinancialPaymentDetail,
      platform: "web"
    });
  });

  it("sourcetypevalue switches for native", async () => {
    Local.FinancialBatch.findOrCreate = jest.fn();

    const Transaction = {
      TransactionCode: "code",
      TransactionDateTime: "now"
    };
    const SourceTypeValue = {
      Url: "example.com"
    };
    const Person = {
      PrimaryAliasId: 10,
      Id: 1
    };
    const FinancialPaymentDetail = {
      Id: 45
    };
    const FinancialPaymentValue = "Visa";

    TransactionTable.find.mockReturnValueOnce(Promise.resolve([]));
    Local.FinancialBatch.findOrCreate.mockReturnValueOnce(
      Promise.resolve({ Id: 30 })
    );
    TransactionTable.post.mockReturnValueOnce(Promise.resolve(20));
    TransactionTable.post.mockClear();

    const data = await Local.findOrCreateTransaction({
      Transaction,
      SourceTypeValue,
      Person,
      FinancialPaymentValue,
      FinancialPaymentDetail,
      platform: "ios"
    });

    expect(Local.FinancialBatch.findOrCreate).toBeCalledWith({
      currencyType: FinancialPaymentValue,
      date: Transaction.TransactionDateTime
    });

    // XXX for some reason, post methods are including the Id when mocked?
    const capturedMock = TransactionTable.post.mock.calls[0][0];
    delete capturedMock.Id;
    expect(capturedMock).toEqual({
      TransactionCode: "code",
      TransactionDateTime: "now",
      AuthorizedPersonAliasId: 10,
      CreatedByPersonAliasId: 10,
      ModifiedByPersonAliasId: 10,
      BatchId: 30,
      SourceTypeValueId: IOS_SOURCE_TYPE,
      FinancialPaymentDetailId: 45,
      ForeignKey: null
    });
    expect(data).toEqual({
      Transaction: capturedMock,
      SourceTypeValue,
      Person,
      FinancialPaymentValue,
      FinancialPaymentDetail,
      platform: "ios"
    });
  });

  it("keeps the batchId as null if not found", async () => {
    Local.FinancialBatch.findOrCreate = jest.fn();

    const Transaction = {
      TransactionCode: "code",
      TransactionDateTime: "now"
    };
    const SourceTypeValue = {
      Url: "example.com"
    };
    const Person = {
      PrimaryAliasId: 10,
      Id: 1
    };
    const FinancialPaymentDetail = {
      Id: 45
    };
    const FinancialPaymentValue = "Visa";

    TransactionTable.find.mockReturnValueOnce(Promise.resolve([]));
    Local.FinancialBatch.findOrCreate.mockReturnValueOnce(Promise.resolve());
    TransactionTable.post.mockReturnValueOnce(Promise.resolve(20));
    TransactionTable.post.mockClear();

    const data = await Local.findOrCreateTransaction({
      Transaction,
      SourceTypeValue,
      Person,
      FinancialPaymentValue,
      FinancialPaymentDetail,
      platform: "web"
    });

    expect(Local.FinancialBatch.findOrCreate).toBeCalledWith({
      currencyType: FinancialPaymentValue,
      date: Transaction.TransactionDateTime
    });

    // XXX for some reason, post methods are including the Id when mocked?
    const capturedMock = TransactionTable.post.mock.calls[0][0];
    delete capturedMock.Id;
    expect(capturedMock).toEqual({
      TransactionCode: "code",
      TransactionDateTime: "now",
      AuthorizedPersonAliasId: 10,
      CreatedByPersonAliasId: 10,
      ModifiedByPersonAliasId: 10,
      SourceTypeValueId: WEB_SOURCE_TYPE,
      FinancialPaymentDetailId: 45,
      ForeignKey: null
    });
    expect(data).toEqual({
      Transaction: capturedMock,
      SourceTypeValue,
      Person,
      FinancialPaymentValue,
      FinancialPaymentDetail,
      platform: "web"
    });
  });
  it("should pass version to foreign key on new job", async () => {
    Local.FinancialBatch.findOrCreate = jest.fn();

    const Transaction = {
      TransactionCode: "code",
      TransactionDateTime: "now"
    };
    const SourceTypeValue = {
      Url: "example.com"
    };
    const Person = {
      PrimaryAliasId: 10,
      Id: 1
    };
    const FinancialPaymentDetail = {
      Id: 45
    };
    const FinancialPaymentValue = "Visa";

    TransactionTable.find.mockReturnValueOnce(Promise.resolve([]));
    Local.FinancialBatch.findOrCreate.mockReturnValueOnce(
      Promise.resolve({ Id: 30 })
    );
    TransactionTable.post.mockReturnValueOnce(Promise.resolve(20));
    TransactionTable.post.mockClear();

    const data = await Local.findOrCreateTransaction({
      Transaction,
      SourceTypeValue,
      Person,
      FinancialPaymentValue,
      FinancialPaymentDetail,
      platform: "web",
      version: "9001"
    });

    expect(Local.FinancialBatch.findOrCreate).toBeCalledWith({
      currencyType: FinancialPaymentValue,
      date: Transaction.TransactionDateTime
    });

    // XXX for some reason, post methods are including the Id when mocked?
    const capturedMock = TransactionTable.post.mock.calls[0][0];
    delete capturedMock.Id;
    expect(capturedMock).toEqual({
      TransactionCode: "code",
      TransactionDateTime: "now",
      AuthorizedPersonAliasId: 10,
      CreatedByPersonAliasId: 10,
      ModifiedByPersonAliasId: 10,
      BatchId: 30,
      SourceTypeValueId: WEB_SOURCE_TYPE,
      FinancialPaymentDetailId: 45,
      ForeignKey: "v9001"
    });
    expect(data).toEqual({
      Transaction: capturedMock,
      SourceTypeValue,
      Person,
      FinancialPaymentValue,
      FinancialPaymentDetail,
      platform: "web",
      version: "9001"
    });
  });
});

describe("findOrCreateSchedule", () => {
  let Local;
  beforeEach(() => {
    Local = new TransactionJobs({ cache: mockedCache });
  });
  afterEach(() => {
    Local = undefined;
  });

  it("keeps going if a there isn't a GatewayScheduleId", async () => {
    const Schedule = {};
    const data = await Local.findOrCreateSchedule({ Schedule });
    expect(data).toEqual({ Schedule });
  });

  it("attempts to find exsiting schedules from GatewayScheduleId", async () => {
    const Schedule = {
      GatewayScheduleId: "code"
    };

    ScheduledTransaction.find.mockReturnValueOnce(Promise.resolve([{ Id: 1 }]));

    const data = await Local.findOrCreateSchedule({ Schedule });

    expect(ScheduledTransaction.find).toBeCalledWith({
      where: { GatewayScheduleId: "code" }
    });

    expect(data).toEqual({
      Schedule: {
        Id: 1,
        GatewayScheduleId: "code"
      }
    });
  });

  it("loads a schedule frequency and creates a schedule", async () => {
    const Schedule = {
      GatewayScheduleId: "code",
      SourceTypeValueId: 1,
      TransactionFrequencyValue: {
        "day-frequency": "7"
      }
    };
    const Person = {
      Id: 1,
      PrimaryAliasId: 3
    };
    const FinancialPaymentDetail = {
      Id: 5
    };
    const SourceTypeValue = {
      Url: "http://example.com"
    };

    ScheduledTransaction.find.mockReturnValueOnce(Promise.resolve([]));
    DefinedValue.find.mockReturnValueOnce(
      Promise.resolve([
        {
          Value: "Weekly",
          Id: 7
        }
      ])
    );
    ScheduledTransaction.post.mockReturnValueOnce(Promise.resolve(2));
    const data = await Local.findOrCreateSchedule({
      Schedule,
      Person,
      FinancialPaymentDetail,
      SourceTypeValue
    });

    expect(DefinedValue.find).toBeCalledWith({
      where: { DefinedTypeId: 23 }
    });
    expect(ScheduledTransaction.post).toBeCalledWith({
      TransactionFrequencyValueId: 7,
      GatewayScheduleId: "code",
      AuthorizedPersonAliasId: 3,
      CreatedByPersonAliasId: 3,
      ModifiedByPersonAliasId: 3,
      FinancialPaymentDetailId: 5,
      SourceTypeValueId: 1,
      Id: 2 // XXX this a bug with Jest
    });

    expect(data).toEqual({
      Schedule: {
        Id: 2,
        TransactionFrequencyValueId: 7,
        GatewayScheduleId: "code",
        AuthorizedPersonAliasId: 3,
        CreatedByPersonAliasId: 3,
        ModifiedByPersonAliasId: 3,
        FinancialPaymentDetailId: 5,
        SourceTypeValueId: 1
      },
      Person,
      FinancialPaymentDetail,
      SourceTypeValue
    });
  });

  it("loads a SourceTypeValue", async () => {
    const Schedule = {
      GatewayScheduleId: "code",
      TransactionFrequencyValue: {
        "day-frequency": "7"
      }
    };
    const Person = {
      Id: 1,
      PrimaryAliasId: 3
    };
    const FinancialPaymentDetail = {
      Id: 5
    };
    const SourceTypeValue = {
      Url: "http://example.com"
    };

    ScheduledTransaction.find.mockReturnValueOnce(Promise.resolve([]));
    DefinedValue.find.mockReturnValueOnce(
      Promise.resolve([
        {
          Value: "Weekly",
          Id: 7
        }
      ])
    );
    DefinedValue.findOne.mockReturnValueOnce(
      Promise.resolve({
        Id: 100
      })
    );
    ScheduledTransaction.post.mockReturnValueOnce(Promise.resolve(2));
    const data = await Local.findOrCreateSchedule({
      Schedule,
      Person,
      FinancialPaymentDetail,
      SourceTypeValue
    });

    expect(DefinedValue.find).toBeCalledWith({
      where: { DefinedTypeId: 23 }
    });
    expect(DefinedValue.findOne).toBeCalledWith({
      where: { Value: SourceTypeValue.Url, DefinedTypeId: 12 }
    });
    expect(ScheduledTransaction.post).toBeCalledWith({
      TransactionFrequencyValueId: 7,
      GatewayScheduleId: "code",
      AuthorizedPersonAliasId: 3,
      CreatedByPersonAliasId: 3,
      ModifiedByPersonAliasId: 3,
      FinancialPaymentDetailId: 5,
      SourceTypeValueId: 100,
      Id: 2 // XXX this a bug with Jest
    });

    expect(data).toEqual({
      Schedule: {
        Id: 2,
        TransactionFrequencyValueId: 7,
        GatewayScheduleId: "code",
        AuthorizedPersonAliasId: 3,
        CreatedByPersonAliasId: 3,
        ModifiedByPersonAliasId: 3,
        FinancialPaymentDetailId: 5,
        SourceTypeValueId: 100
      },
      Person,
      FinancialPaymentDetail,
      SourceTypeValue
    });
  });

  it("loads a default SourceTypeValue", async () => {
    const Schedule = {
      GatewayScheduleId: "code",
      TransactionFrequencyValue: {
        "day-frequency": "7"
      }
    };
    const Person = {
      Id: 1,
      PrimaryAliasId: 3
    };
    const FinancialPaymentDetail = {
      Id: 5
    };
    const SourceTypeValue = {
      Url: "http://example.com"
    };

    ScheduledTransaction.find.mockReturnValueOnce(Promise.resolve([]));
    DefinedValue.find.mockReturnValueOnce(
      Promise.resolve([
        {
          Value: "Weekly",
          Id: 7
        }
      ])
    );
    DefinedValue.findOne.mockReturnValueOnce(Promise.resolve());
    ScheduledTransaction.post.mockReturnValueOnce(Promise.resolve(2));
    const data = await Local.findOrCreateSchedule({
      Schedule,
      Person,
      FinancialPaymentDetail,
      SourceTypeValue
    });

    expect(DefinedValue.find).toBeCalledWith({
      where: { DefinedTypeId: 23 }
    });
    expect(DefinedValue.findOne).toBeCalledWith({
      where: { Value: SourceTypeValue.Url, DefinedTypeId: 12 }
    });
    expect(ScheduledTransaction.post).toBeCalledWith({
      TransactionFrequencyValueId: 7,
      GatewayScheduleId: "code",
      AuthorizedPersonAliasId: 3,
      CreatedByPersonAliasId: 3,
      ModifiedByPersonAliasId: 3,
      FinancialPaymentDetailId: 5,
      SourceTypeValueId: 10,
      Id: 2 // XXX this a bug with Jest
    });

    expect(data).toEqual({
      Schedule: {
        Id: 2,
        TransactionFrequencyValueId: 7,
        GatewayScheduleId: "code",
        AuthorizedPersonAliasId: 3,
        CreatedByPersonAliasId: 3,
        ModifiedByPersonAliasId: 3,
        FinancialPaymentDetailId: 5,
        SourceTypeValueId: 10
      },
      Person,
      FinancialPaymentDetail,
      SourceTypeValue
    });
  });

  it("updates a schedule and removes is details", async () => {
    const Schedule = {
      Id: 10,
      GatewayScheduleId: "code",
      SourceTypeValueId: 7
    };
    const Person = {
      Id: 1,
      PrimaryAliasId: 3
    };
    const FinancialPaymentDetail = {
      Id: 5
    };
    const SourceTypeValue = {
      Url: "http://example.com"
    };

    ScheduledTransaction.find.mockReturnValueOnce(Promise.resolve([]));
    ScheduledTransaction.patch.mockReturnValueOnce(Promise.resolve(true));
    ScheduledTransactionDetail.find.mockReturnValueOnce(
      Promise.resolve([{ Id: 1 }])
    );
    ScheduledTransactionDetail.delete.mockReturnValueOnce(
      Promise.resolve(true)
    );

    const data = await Local.findOrCreateSchedule({
      Schedule,
      Person,
      FinancialPaymentDetail,
      SourceTypeValue
    });

    expect(ScheduledTransaction.patch).toBeCalledWith(10, {
      SourceTypeValueId: 7,
      GatewayScheduleId: "code",
      AuthorizedPersonAliasId: 3,
      CreatedByPersonAliasId: 3,
      ModifiedByPersonAliasId: 3,
      FinancialPaymentDetailId: 5,
      Id: 10 // XXX this a bug with Jest
    });
    expect(ScheduledTransactionDetail.find).toBeCalledWith({
      where: { ScheduledTransactionId: 10 },
      attributes: ["Id"]
    });
    expect(ScheduledTransactionDetail.delete).toBeCalledWith(1);

    expect(data).toEqual({
      Schedule: {
        Id: 10,
        GatewayScheduleId: "code",
        AuthorizedPersonAliasId: 3,
        CreatedByPersonAliasId: 3,
        ModifiedByPersonAliasId: 3,
        FinancialPaymentDetailId: 5,
        SourceTypeValueId: 7
      },
      Person,
      FinancialPaymentDetail,
      SourceTypeValue
    });
  });
});

describe("createTransactionDetails", () => {
  let Local;
  beforeEach(() => {
    Local = new TransactionJobs({ cache: mockedCache });
  });
  afterEach(() => {
    Local = undefined;
  });

  it("ignores details with Ids present", async () => {
    const TransactionDetails = [{ Id: 1 }];
    const data = await Local.createTransactionDetails({ TransactionDetails });
    expect(data).toEqual({ TransactionDetails });
  });

  it("looks up a financial account with campus and account info", async () => {
    const Transaction = { Id: 1 };
    const Schedule = {};
    const Person = { Id: 2, PrimaryAliasId: 3 };
    const TransactionDetails = [{ AccountId: 4, Amount: 4 }];
    const Campus = { Id: 5 };

    FinancialAccount.findOne.mockReturnValueOnce(Promise.resolve({ Id: 6 }));
    TransactionDetail.post.mockReturnValueOnce(Promise.resolve(7));

    const data = await Local.createTransactionDetails({
      Transaction,
      Schedule,
      Person,
      TransactionDetails,
      Campus
    });

    expect(FinancialAccount.findOne).toBeCalledWith({
      where: { CampusId: 5, ParentAccountId: 4 }
    });
    expect(TransactionDetail.post).toBeCalledWith({
      AccountId: 6,
      CreatedByPersonAliasId: Person.PrimaryAliasId,
      ModifiedByPersonAliasId: Person.PrimaryAliasId,
      Amount: 4,
      TransactionId: 1,
      Id: 7 // XXX bug in Jest
    });
    expect(data).toEqual({
      Transaction,
      Schedule,
      Person,
      TransactionDetails: [
        {
          AccountId: 6,
          CreatedByPersonAliasId: Person.PrimaryAliasId,
          ModifiedByPersonAliasId: Person.PrimaryAliasId,
          Amount: 4,
          TransactionId: 1,
          Id: 7 // XXX bug in Jest
        }
      ],
      Campus
    });
  });

  it("throws an error if an invalid campus is being used", () => {
    const Transaction = { Id: 1 };
    const Schedule = {};
    const Person = { Id: 2, PrimaryAliasId: 3 };
    const TransactionDetails = [{ AccountId: 4, Amount: 4 }];
    const Campus = { Id: 13 };

    FinancialAccount.findOne.mockReturnValueOnce(Promise.resolve({ Id: 6 }));
    TransactionDetail.post.mockReturnValueOnce(Promise.resolve(7));

    expect(
      Local.createTransactionDetails({
        Transaction,
        Schedule,
        Person,
        TransactionDetails,
        Campus
      })
    ).toThrow();
  });

  it("if no account is found, it looks up the person's family campus and tries again", async () => {
    const Transaction = { Id: 1 };
    const Schedule = {};
    const Person = { Id: 2, PrimaryAliasId: 3 };
    const TransactionDetails = [{ AccountId: 4, Amount: 4 }];
    const Campus = { Id: 5 };

    FinancialAccount.findOne
      .mockReturnValueOnce(Promise.resolve())
      .mockReturnValueOnce(Promise.resolve({ Id: 7 }));

    Group.findOne.mockReturnValueOnce(Promise.resolve({ Campus: { Id: 6 } }));
    TransactionDetail.post.mockReturnValueOnce(Promise.resolve(8));

    const data = await Local.createTransactionDetails({
      Transaction,
      Schedule,
      Person,
      TransactionDetails,
      Campus
    });

    expect(FinancialAccount.findOne).toBeCalledWith({
      where: { CampusId: 5, ParentAccountId: 4 }
    });
    expect(Group.findOne).toBeCalledWith({
      where: { GroupTypeId: 10 }, // family
      include: [
        { model: GroupMember.model, where: { PersonId: `${Person.Id}` } },
        { model: CampusTable.model }
      ]
    });
    expect(FinancialAccount.findOne).toBeCalledWith({
      where: { CampusId: 6, ParentAccountId: 4 }
    });
    expect(TransactionDetail.post).toBeCalledWith({
      AccountId: 7,
      CreatedByPersonAliasId: Person.PrimaryAliasId,
      ModifiedByPersonAliasId: Person.PrimaryAliasId,
      Amount: 4,
      TransactionId: 1,
      Id: 8 // XXX bug in Jest
    });
    expect(data).toEqual({
      Transaction,
      Schedule,
      Person,
      TransactionDetails: [
        {
          AccountId: 7,
          CreatedByPersonAliasId: Person.PrimaryAliasId,
          ModifiedByPersonAliasId: Person.PrimaryAliasId,
          Amount: 4,
          TransactionId: 1,
          Id: 8 // XXX bug in Jest
        }
      ],
      Campus
    });
  });
  xit("if it is a schedule, it creates ScheduleTransactionDetails", async () => {
    const Transaction = {};
    const Schedule = { Id: 1 };
    const Person = { Id: 2, PrimaryAliasId: 3 };
    const TransactionDetails = [{ AccountId: 4, Amount: 4 }];
    const Campus = { Id: 5 };

    FinancialAccount.findOne.mockReturnValueOnce(Promise.resolve({ Id: 6 }));
    TransactionDetail.post.mockReturnValueOnce(Promise.resolve(7));

    const data = await Local.createTransactionDetails({
      Transaction,
      Schedule,
      Person,
      TransactionDetails,
      Campus
    });

    expect(FinancialAccount.findOne).toBeCalledWith({
      where: { CampusId: 5, ParentAccountId: 4 }
    });
    expect(ScheduledTransactionDetail.post).toBeCalledWith({
      AccountId: 6,
      CreatedByPersonAliasId: Person.PrimaryAliasId,
      ModifiedByPersonAliasId: Person.PrimaryAliasId,
      Amount: 4,
      ScheduledTransactionDetailId: 1,
      Id: 7 // XXX bug in Jest
    });
    expect(data).toEqual({
      Transaction,
      Schedule,
      Person,
      TransactionDetails: [
        {
          AccountId: 6,
          CreatedByPersonAliasId: Person.PrimaryAliasId,
          ModifiedByPersonAliasId: Person.PrimaryAliasId,
          Amount: 4,
          TransactionId: 1,
          Id: 7 // XXX bug in Jest
        }
      ],
      Campus
    });
  });
});

describe("createSavedPayment", () => {
  let Local;
  beforeEach(() => {
    Local = new TransactionJobs({ cache: mockedCache });
  });
  afterEach(() => {
    Local = undefined;
  });

  it("keeps going if a there is a saved account id already", async () => {
    const FinancialPersonSavedAccount = {
      Id: 1,
      Name: "foo",
      ReferenceNumber: "10"
    };
    const data = await Local.createSavedPayment({
      FinancialPersonSavedAccount
    });
    expect(data).toEqual({ FinancialPersonSavedAccount });
  });

  it("keeps going if a there isn't a saved account name", async () => {
    const FinancialPersonSavedAccount = { ReferenceNumber: "10" };
    const data = await Local.createSavedPayment({
      FinancialPersonSavedAccount
    });
    expect(data).toEqual({ FinancialPersonSavedAccount });
  });

  // it("keeps going if a there isn't a saved account ReferenceNumber", async () => {
  //   const FinancialPersonSavedAccount = { Name: "Test" };
  //   const data = await Local.createSavedPayment({
  //     FinancialPersonSavedAccount,
  //   });
  //   expect(data).toEqual({ FinancialPersonSavedAccount });
  // });

  it("creates a new savedPaymentDeatail and creates the saved payment", async () => {
    const FinancialPersonSavedAccount = {
      Name: "Test",
      ReferenceNumber: "100"
    };
    const Person = { PrimaryAliasId: 12 };
    const FinancialPaymentDetail = { Id: 10 };

    Local.createPaymentDetail = jest.fn(data => Promise.resolve(data));
    SavedPayment.post.mockReturnValueOnce(Promise.resolve(10));

    const data = await Local.createSavedPayment({
      Person,
      FinancialPersonSavedAccount,
      FinancialPaymentDetail
    });

    expect(SavedPayment.post).toBeCalledWith({
      Id: 10,
      Name: "Test",
      PersonAliasId: Person.PrimaryAliasId,
      FinancialPaymentDetailId: FinancialPaymentDetail.Id,
      CreatedByPersonAliasId: Person.PrimaryAliasId,
      ModifiedByPersonAliasId: Person.PrimaryAliasId,
      ReferenceNumber: "100"
    });
    expect(data).toEqual({
      Person,
      FinancialPersonSavedAccount,
      FinancialPaymentDetail
    });
  });
});

describe("updateBatchControlAmount", () => {
  let Local;
  beforeEach(() => {
    Local = new TransactionJobs({ cache: mockedCache });
  });
  afterEach(() => {
    Local = undefined;
  });

  it("returns if already update the batch", async () => {
    const hasUpdatedBatch = true;
    const data = await Local.updateBatchControlAmount({ hasUpdatedBatch });
    expect(data).toEqual({ hasUpdatedBatch });
  });

  it("returns if missing transaction id", async () => {
    const Transaction = { BatchId: 1 };
    const TransactionDetails = [{ Amount: 2 }];
    const data = await Local.updateBatchControlAmount({
      Transaction,
      TransactionDetails
    });
    expect(data).toEqual({
      Transaction,
      TransactionDetails
    });
  });

  it("returns if missing transaction batch id", async () => {
    const Transaction = { Id: 1 };
    const TransactionDetails = [{ Amount: 2 }];
    const data = await Local.updateBatchControlAmount({
      Transaction,
      TransactionDetails
    });
    expect(data).toEqual({
      Transaction,
      TransactionDetails
    });
  });

  it("returns if missing transaction details", async () => {
    const Transaction = { BatchId: 1, Id: 1 };
    const TransactionDetails = [];
    const data = await Local.updateBatchControlAmount({
      Transaction,
      TransactionDetails
    });
    expect(data).toEqual({
      Transaction,
      TransactionDetails
    });
  });

  it("prevents malformed data from posting", async () => {
    const Transaction = { BatchId: 1, Id: 1 };
    const TransactionDetails = [{ Amount: 2 }, { Amount: "3" }];
    const data = await Local.updateBatchControlAmount({
      Transaction,
      TransactionDetails
    });
    expect(data).toEqual({
      Transaction,
      TransactionDetails
    });
  });

  it("returns if batch can't be found in Rock", async () => {
    const Transaction = { BatchId: 1, Id: 5 };
    const TransactionDetails = [{ Amount: 2 }, { Amount: 3 }];
    FinancialBatchTable.findOne.mockReturnValueOnce(Promise.resolve());
    const data = await Local.updateBatchControlAmount({
      Transaction,
      TransactionDetails
    });

    expect(FinancialBatchTable.findOne).toBeCalledWith({ where: { Id: 1 } });
    expect(data).toEqual({
      Transaction,
      TransactionDetails
    });
  });

  it("updates the control amount and sets a finished flag", async () => {
    const Transaction = { BatchId: 1, Id: 5 };
    const TransactionDetails = [{ Amount: 2 }, { Amount: 3 }];
    FinancialBatchTable.findOne.mockReturnValueOnce(
      Promise.resolve({ Id: 5, ControlAmount: 1 })
    );
    FinancialBatchTable.patch.mockReturnValueOnce(Promise.resolve(true));
    const data = await Local.updateBatchControlAmount({
      Transaction,
      TransactionDetails
    });

    expect(FinancialBatchTable.patch).toBeCalledWith(5, { ControlAmount: 6 });
    expect(data).toEqual({
      Transaction,
      TransactionDetails,
      hasUpdatedBatch: true
    });
  });
});

describe("sendGivingEmail", () => {
  let Local;
  beforeEach(() => {
    Local = new TransactionJobs({ cache: mockedCache });
  });
  afterEach(() => {
    Local = undefined;
  });

  it("keeps going if a there the email has already been sent", async () => {
    const CommunicationSent = true;
    const data = await Local.sendGivingEmail({ CommunicationSent });
    expect(data).toEqual({ CommunicationSent });
  });

  it("doesn't send an email for a schedule transaction", async () => {
    const Schedule = {
      GatewayScheduleId: "100"
    };
    const data = await Local.sendGivingEmail({ Schedule });
    expect(data).toEqual({ Schedule });
  });

  it("looks up a person, then calls sendEmail with the needed data", async () => {
    const Person = { Id: 1, PrimaryAliasId: 2 };
    const TransactionDetails = [
      {
        Amount: 1,
        AccountName: "Name",
        AccountId: 3
      }
    ];
    const Transaction = { TransactionCode: "code" };
    const FinancialPaymentDetail = {
      AccountNumberMasked: "4xxxxxxxxxxx1111"
    };
    const Schedule = {};

    PersonTable.findOne.mockReturnValueOnce(
      Promise.resolve({
        Id: 1,
        FirstName: "James",
        Email: "james.baxley@newspring.cc",
        LastName: "Baxley"
      })
    );

    Local.sendEmail = jest.fn();
    Local.sendEmail.mockReturnValueOnce(Promise.resolve());
    const data = await Local.sendGivingEmail({
      Schedule,
      Person,
      TransactionDetails,
      Transaction,
      FinancialPaymentDetail
    });

    expect(PersonTable.findOne).toBeCalledWith({
      where: { Id: 1 }
    });
    expect(Local.sendEmail).toBeCalledWith("Giving Receipt", [2], {
      Person: {
        Id: 1,
        FirstName: "James",
        Email: "james.baxley@newspring.cc",
        LastName: "Baxley"
      },
      TotalAmount: 1,
      GaveAnonymous: false,
      ReceiptEmail: "james.baxley@newspring.cc",
      ReceiptEmailed: true,
      LastName: "Baxley",
      FirstNames: "James",
      TransactionCode: "code",
      Amounts: TransactionDetails,
      AccountNumberMasked: "1111"
    });
    expect(data).toEqual({
      Schedule,
      Person,
      TransactionDetails,
      Transaction,
      FinancialPaymentDetail,
      CommunicationSent: true
    });
  });

  it("skips negative or missing account details", async () => {
    const Person = { Id: 1, PrimaryAliasId: 2 };
    const TransactionDetails = [
      { Amount: 1, AccountName: "Name", AccountId: 3 },
      { Amount: 1, AccountName: "Name" },
      { Amount: -1, AccountName: "Name", AccountId: 3 }
    ];
    const Transaction = { TransactionCode: "code" };
    const FinancialPaymentDetail = {
      AccountNumberMasked: "4xxxxxxxxxxx1111"
    };
    const Schedule = {};

    PersonTable.findOne.mockReturnValueOnce(
      Promise.resolve({
        Id: 1,
        FirstName: "James",
        Email: "james.baxley@newspring.cc",
        LastName: "Baxley"
      })
    );

    Local.sendEmail = jest.fn();
    Local.sendEmail.mockReturnValueOnce(Promise.resolve());
    const data = await Local.sendGivingEmail({
      Schedule,
      Person,
      TransactionDetails,
      Transaction,
      FinancialPaymentDetail
    });

    expect(PersonTable.findOne).toBeCalledWith({
      where: { Id: 1 }
    });
    expect(Local.sendEmail).toBeCalledWith("Giving Receipt", [2], {
      Person: {
        Id: 1,
        FirstName: "James",
        Email: "james.baxley@newspring.cc",
        LastName: "Baxley"
      },
      TotalAmount: 1,
      GaveAnonymous: false,
      ReceiptEmail: "james.baxley@newspring.cc",
      ReceiptEmailed: true,
      LastName: "Baxley",
      FirstNames: "James",
      TransactionCode: "code",
      Amounts: [{ Amount: 1, AccountName: "Name", AccountId: 3 }],
      AccountNumberMasked: "1111"
    });
    expect(data).toEqual({
      Schedule,
      Person,
      TransactionDetails,
      Transaction,
      FinancialPaymentDetail,
      CommunicationSent: true
    });
  });

  it("tries to load a nickname", async () => {
    const Person = { Id: 1, PrimaryAliasId: 2 };
    const TransactionDetails = [
      { Amount: 1, AccountName: "Name", AccountId: 3 },
      { Amount: 1, AccountName: "Name" },
      { Amount: -1, AccountName: "Name", AccountId: 3 }
    ];
    const Transaction = { TransactionCode: "code" };
    const FinancialPaymentDetail = {
      AccountNumberMasked: "4xxxxxxxxxxx1111"
    };
    const Schedule = {};

    PersonTable.findOne.mockReturnValueOnce(
      Promise.resolve({
        Id: 1,
        FirstName: "James",
        NickName: "Jimmy",
        Email: "james.baxley@newspring.cc",
        LastName: "Baxley"
      })
    );

    Local.sendEmail = jest.fn();
    Local.sendEmail.mockReturnValueOnce(Promise.resolve());
    const data = await Local.sendGivingEmail({
      Schedule,
      Person,
      TransactionDetails,
      Transaction,
      FinancialPaymentDetail
    });

    expect(PersonTable.findOne).toBeCalledWith({
      where: { Id: 1 }
    });
    expect(Local.sendEmail).toBeCalledWith("Giving Receipt", [2], {
      Person: {
        Id: 1,
        FirstName: "James",
        NickName: "Jimmy",
        Email: "james.baxley@newspring.cc",
        LastName: "Baxley"
      },
      TotalAmount: 1,
      GaveAnonymous: false,
      ReceiptEmail: "james.baxley@newspring.cc",
      ReceiptEmailed: true,
      LastName: "Baxley",
      FirstNames: "Jimmy",
      TransactionCode: "code",
      Amounts: [{ Amount: 1, AccountName: "Name", AccountId: 3 }],
      AccountNumberMasked: "1111"
    });
    expect(data).toEqual({
      Schedule,
      Person,
      TransactionDetails,
      Transaction,
      FinancialPaymentDetail,
      CommunicationSent: true
    });
  });
});
