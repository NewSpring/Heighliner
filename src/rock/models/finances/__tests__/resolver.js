import moment from "moment";
import resolver from "../resolver";

import render from "../util/statement";

jest.mock("../util/statement");

describe("Query", () => {
  describe("SavedPayment", () => {
    it("finds by person alias", () => {
      const models = {
        SavedPayment: {
          findByPersonAlias: jest.fn(),
        },
      };

      const person = {
        PersonAliasId: 100,
        aliases: [22222],
      };

      resolver.Query.savedPayments(
        null,
        { limit: 3, cache: true, skip: 1 },
        { models, person },
      );
      expect(models.SavedPayment.findByPersonAlias).toBeCalledWith(
        [22222],
        {
          limit: 3,
          offset: 1,
        },
        { cache: true },
      );
    });
  });
  describe("Transactions", () => {
    it("finds transactions by GivingGroupId if it is defined", () => {
      const models = {
        Transaction: {
          findByGivingGroup: jest.fn(),
          findByPersonAlias: jest.fn(),
        },
      };

      const person = {
        PersonAliasId: 100,
        aliases: [22222],
        GivingGroupId: 7878,
      };

      resolver.Query.transactions(
        null,
        {
          people: [10, 11],
          start: "01/15",
          end: "01/16",
          limit: 3,
          skip: 1,
          cache: true,
        },
        { models, person },
      );
      expect(models.Transaction.findByGivingGroup).toBeCalledWith(
        {
          id: 7878,
          include: [10, 11],
          start: "01/15",
          end: "01/16",
        },
        { limit: 3, offset: 1 },
        { cache: true },
      );
      expect(models.Transaction.findByPersonAlias).not.toBeCalled();
    });
    it("finds transactions by PersonAliases if no GroupId is defined", () => {
      const models = {
        Transaction: {
          findByGivingGroup: jest.fn(),
          findByPersonAlias: jest.fn(),
        },
      };

      const person = {
        PersonAliasId: 100,
        aliases: [22222],
      };

      resolver.Query.transactions(
        null,
        {
          people: [10, 11],
          start: "01/15",
          end: "01/16",
          limit: 3,
          skip: 1,
          cache: true,
        },
        { models, person },
      );
      expect(models.Transaction.findByGivingGroup).not.toBeCalled();
      expect(models.Transaction.findByPersonAlias).toBeCalledWith(
        [22222],
        { limit: 3, offset: 1 },
        { cache: true },
      );
    });
  });
  describe("ScheduledTransaction", () => {
    it("finds schedules by PersonAliases", () => {
      const models = {
        ScheduledTransaction: {
          findByPersonAlias: jest.fn(),
        },
      };

      const person = {
        PersonAliasId: 100,
        aliases: [22222],
      };

      resolver.Query.scheduledTransactions(
        null,
        { limit: 3, cache: true, skip: 1, isActive: true },
        { models, person },
      );
      expect(models.ScheduledTransaction.findByPersonAlias).toBeCalledWith(
        [22222],
        { limit: 3, offset: 1, isActive: true },
        { cache: true },
      );
    });
  });
  describe("Accounts", () => {
    it("returns all accounts if none defined", () => {
      const models = {
        FinancialAccount: {
          find: jest.fn(),
        },
      };

      resolver.Query.accounts(null, { allFunds: true }, { models });
      expect(models.FinancialAccount.find).toBeCalledWith(
        {
          name: undefined,
          isActive: undefined,
          isPublic: undefined,
        },
        { all: true },
      );
    });

    it("returns the giving account specified", () => {
      const models = {
        FinancialAccount: {
          find: jest.fn(),
        },
      };

      resolver.Query.accounts(
        null,
        { name: "Tesla", isActive: true, isPublic: true },
        { models },
      );
      expect(models.FinancialAccount.find).toBeCalledWith(
        {
          Name: "Tesla",
          IsActive: true,
          IsPublic: true,
        },
        { all: undefined },
      );
    });
  });
  describe("AccountFromCashtag", () => {
    it("returns an account from a cashtag", async () => {
      const models = {
        FinancialAccount: {
          find: jest.fn(() => Promise.resolve([])),
        },
      };

      resolver.Query.accountFromCashTag(
        null,
        { cashTag: "$tesla" },
        { models },
      );
      expect(models.FinancialAccount.find).toBeCalledWith({
        IsActive: true,
        IsPublic: true,
      });
    });
  });
});

describe("Mutation", () => {
  describe("syncTransactions", () => {
    it("has a `syncTransactions` which passes args to Transaction.syncTransactions", () => {
      const models = {
        Transaction: {
          syncTransactions: jest.fn(),
        },
      };
      resolver.Mutation.syncTransactions(null, { foo: "bar" }, { models });
      expect(models.Transaction.syncTransactions).toBeCalledWith({
        foo: "bar",
      });
    });
  });
  describe("cancelSavedPayment", () => {
    it("loads gatewayDetails and removes a saved payment", async () => {
      const models = {
        Transaction: {
          loadGatewayDetails: jest.fn(() => Promise.resolve({ nmi: true })),
        },
        SavedPayment: {
          removeFromEntityId: jest.fn(() => Promise.resolve(true)),
        },
      };
      await resolver.Mutation.cancelSavedPayment(
        null,
        { entityId: 1, gateway: "nmi" },
        { models },
      );
      expect(models.Transaction.loadGatewayDetails).toBeCalledWith("nmi");
      expect(models.SavedPayment.removeFromEntityId).toBeCalledWith(1, {
        nmi: true,
      });
    });
  });
  describe("createOrder", () => {
    it("translates the args and context into the model call", async () => {
      const models = {
        Transaction: {
          createOrder: jest.fn(() => Promise.resolve()),
        },
      };
      await resolver.Mutation.createOrder(
        null,
        {
          instant: true,
          id: 1,
          data: '{ "foo": true }',
        },
        {
          person: { Id: 1 },
          ip: "ip address",
          req: {
            headers: {
              referer: "https://example.com/give/now",
              origin: "https://example.com/",
            },
          },
          models,
        },
      );

      expect(models.Transaction.createOrder).toBeCalledWith({
        data: { foo: true },
        instant: true,
        id: 1,
        ip: "ip address",
        requestUrl: "https://example.com/give/now",
        origin: "https://example.com/",
      }, { Id: 1 }, models);
    });
  });
  describe("validate", () => {
    it("loads gatewayDetails and validates a card", async () => {
      const models = {
        Transaction: {
          loadGatewayDetails: jest.fn(() => Promise.resolve({ nmi: true })),
        },
        SavedPayment: {
          validate: jest.fn(() => Promise.resolve(true)),
        },
      };
      await resolver.Mutation.validate(
        null,
        { token: "token", gateway: "nmi" },
        { models },
      );
      expect(models.Transaction.loadGatewayDetails).toBeCalledWith("nmi");
      expect(models.SavedPayment.validate).toBeCalledWith(
        { token: "token" },
        { nmi: true },
      );
    });
    it("gracefully handles errors", async () => {
      const models = {
        Transaction: {
          loadGatewayDetails: jest.fn(() => Promise.resolve({ nmi: true })),
        },
        SavedPayment: {
          validate: jest.fn(() => Promise.reject(new Error("failure"))),
        },
      };

      const result = await resolver.Mutation.validate(
        null,
        { token: "token", gateway: "nmi" },
        { models },
      );
      expect(models.Transaction.loadGatewayDetails).toBeCalledWith("nmi");
      expect(models.SavedPayment.validate).toBeCalledWith(
        { token: "token" },
        { nmi: true },
      );
      expect(result).toEqual({
        error: "failure",
        code: undefined,
        success: false,
      });
    });
  });
  describe("completeOrder", () => {
    it("early returns without a token", async () => {
      const models = {
        Transaction: {
          completeOrder: jest.fn(() => Promise.resolve({ nmi: true })),
        },
      };
      const result = await resolver.Mutation.completeOrder(
        null,
        {
          token: undefined,
          accountName: "card",
          scheduleId: 1,
        },
        {
          models,
          person: { Id: 1 },
          req: {
            headers: {
              origin: "https://example.com",
            },
          },
        },
      );

      expect(models.Transaction.completeOrder).not.toBeCalled();
      expect(result).toEqual(null);
    });
    it("passes args and context to the method", async () => {
      const models = {
        Transaction: {
          completeOrder: jest.fn(() => Promise.resolve({ nmi: true })),
        },
      };
      await resolver.Mutation.completeOrder(
        null,
        {
          token: "token",
          accountName: "card",
          scheduleId: 1,
        },
        {
          models,
          person: { Id: 1 },
          req: {
            headers: {
              origin: "https://example.com",
            },
          },
        },
      );

      expect(models.Transaction.completeOrder).toBeCalledWith({
        token: "token",
        accountName: "card",
        person: { Id: 1 },
        origin: "https://example.com",
        scheduleId: 1,
      });
    });
    it("passes args and context to the method", async () => {
      const models = {
        Transaction: {
          completeOrder: jest.fn(() => Promise.reject(new Error("failure"))),
        },
      };
      const result = await resolver.Mutation.completeOrder(
        null,
        {
          token: "token",
          accountName: "card",
          scheduleId: 1,
        },
        {
          models,
          person: { Id: 1 },
          req: {
            headers: {
              origin: "https://example.com",
            },
          },
        },
      );

      expect(models.Transaction.completeOrder).toBeCalledWith({
        token: "token",
        accountName: "card",
        person: { Id: 1 },
        origin: "https://example.com",
        scheduleId: 1,
      });
      expect(result).toEqual({
        error: "failure",
        code: undefined,
        success: false,
      });
    });
  });
  describe("savePayment", () => {
    it("loads gatewayDetails and saves a card", async () => {
      const models = {
        Transaction: {
          loadGatewayDetails: jest.fn(() => Promise.resolve({ nmi: true })),
        },
        SavedPayment: {
          save: jest.fn(() => Promise.resolve(true)),
        },
      };
      await resolver.Mutation.savePayment(
        null,
        { token: "token", gateway: "nmi", accountName: "visa" },
        { models, person: { Id: 1 } },
      );
      expect(models.Transaction.loadGatewayDetails).toBeCalledWith("nmi");
      expect(models.SavedPayment.save).toBeCalledWith(
        {
          token: "token",
          name: "visa",
          person: { Id: 1 },
        },
        { nmi: true },
      );
    });
  });
  describe("cancelSchedule", () => {
    it("loads gatewayDetails and cancels a schedule", async () => {
      const models = {
        Transaction: {
          loadGatewayDetails: jest.fn(() => Promise.resolve({ nmi: true })),
        },
        ScheduledTransaction: {
          cancelNMISchedule: jest.fn(() => Promise.resolve(true)),
        },
      };
      await resolver.Mutation.cancelSchedule(
        null,
        { entityId: 1, gateway: "nmi" },
        { models },
      );
      expect(models.Transaction.loadGatewayDetails).toBeCalledWith("nmi");
      expect(models.ScheduledTransaction.cancelNMISchedule).toBeCalledWith(1, {
        nmi: true,
      });
    });
    it("gracefully handles errors", async () => {
      const models = {
        Transaction: {
          loadGatewayDetails: jest.fn(() => Promise.resolve({ nmi: true })),
        },
        ScheduledTransaction: {
          cancelNMISchedule: jest.fn(() =>
            Promise.reject(new Error("failure"))),
        },
      };
      const result = await resolver.Mutation.cancelSchedule(
        null,
        { entityId: 1, gateway: "nmi" },
        { models },
      );
      expect(models.Transaction.loadGatewayDetails).toBeCalledWith("nmi");
      expect(models.ScheduledTransaction.cancelNMISchedule).toBeCalledWith(1, {
        nmi: true,
      });
      expect(result).toEqual({
        error: "failure",
        code: undefined,
        success: false,
      });
    });
  });

  describe("transactionStatement", () => {
    it("properly calls the util to render a user's statement", async () => {
      render.mockImplementation(data => Promise.resolve(data));
      const person = { GivingGroupId: 1, Id: 1 };
      const models = {
        Transaction: {
          getStatement: jest.fn(() =>
            Promise.resolve({ total: 0, transactions: [] })),
        },
        Person: {
          getHomesFromId: jest.fn(() => Promise.resolve([1, 2])),
        },
      };
      await resolver.Mutation.transactionStatement(
        null,
        { people: [1, 2], start: "", end: "" },
        { models, person },
      );

      // const defaultStart = moment().startOf("year");
      expect(models.Transaction.getStatement).toBeCalledWith({
        start: "",
        end: "",
        givingGroupId: 1,
        people: [1, 2],
      });
      expect(models.Person.getHomesFromId).toBeCalledWith(1);
      expect(render).toBeCalledWith({
        home: 1,
        person: person,
        total: 0,
        transactions: [],
      });
    });
    it("gracefully handles errors", async () => {
      render.mockImplementation(data => Promise.resolve(data));
      const person = { GivingGroupId: 1, Id: 1 };
      const models = {
        Transaction: {
          getStatement: jest.fn(() =>
            Promise.reject(new Error("force an error"))),
        },
        Person: {
          getHomesFromId: jest.fn(() =>
            Promise.reject(new Error("force an error"))),
        },
      };
      const result = await resolver.Mutation.transactionStatement(
        null,
        { people: [1, 2], start: "", end: "" },
        { models, person },
      );

      expect(models.Transaction.getStatement).toBeCalled();
      expect(models.Person.getHomesFromId).toBeCalled();
      expect(render).toBeCalledWith({
        home: 1,
        person: person,
        total: 0,
        transactions: [],
      });
      expect(result).toEqual({
        code: 500,
        error: "force an error",
        success: false,
      });
    });
  });
});

const sampleData = {
  account: {
    Id: 200,
    ParentAccountId: 300,
    CampusId: 1,
    Name: "Fund",
    PublicName: "Fund",
    Description: "This is a giving fund",
    IsTaxDeductible: true,
    Order: 1,
    IsActive: true,
    StartDate: "2013-11-25T21:50:28.000Z",
    EndDate: "2016-03-07T08:28:36.133Z",
    AccountTypeValueId: 2,
    CreatedDateTime: "2013-11-25T21:50:28.000Z",
    ModifiedDateTime: "2016-03-07T08:28:36.133Z",
    Url: "http://image.image",
    PublicDescription: "A public description",
    IsPublic: true,
  },
  transaction: {
    Id: 14,
    TransactionDateTime: "2013-11-25T21:50:28.000Z",
    TransactionCode: null,
    Summary: "Reference Number: 32343782727503333424",
    TransactionTypeValueId: 53,
    SourceTypeValueId: 10,
    ScheduledTransactionId: null,
    CreatedDateTime: "2013-11-25T21:50:28.000Z",
    ModifiedDateTime: "2016-03-07T08:28:36.133Z",
    ProcessedDateTime: null,
    AuthorizedPersonAliasId: 44255,
    FinancialGatewayId: null,
    FinancialPaymentDetailId: 1465230,
    Status: null,
    StatusMessage: null,
    FinancialTransactionDetails: [
      {
        Id: 140,
        TransactionId: 14,
        AccountId: 10,
        Amount: 100,
        Summary: null,
        CreatedDateTime: "2013-11-26T12:57:44.000Z",
        ModifiedDateTime: null,
      },
    ],
  },
};

describe("FinancialAccount", () => {
  it("should have an Id", () => {
    const { FinancialAccount } = resolver;

    const entityId = FinancialAccount.entityId(sampleData.account);
    expect(entityId).toEqual(sampleData.account.Id);
  });

  it("should have a Name", () => {
    const { FinancialAccount } = resolver;

    const Name = FinancialAccount.name(sampleData.account);
    expect(Name).toEqual(sampleData.account.Name);
  });

  it("should have an Order", () => {
    const { FinancialAccount } = resolver;

    const order = FinancialAccount.order(sampleData.account);
    expect(order).toEqual(sampleData.account.Order);
  });

  it("should have a Description", () => {
    const { FinancialAccount } = resolver;

    const description = FinancialAccount.description(sampleData.account);
    expect(description).toEqual(sampleData.account.PublicDescription);
  });

  it("should have a summary", () => {
    const { FinancialAccount } = resolver;

    const summary = FinancialAccount.summary(sampleData.account);
    expect(summary).toEqual(sampleData.account.Description);
  });

  it("should have a start date", () => {
    const { FinancialAccount } = resolver;

    const startDate = FinancialAccount.start(sampleData.account);
    expect(startDate).toEqual(sampleData.account.StartDate);
  });

  it("should have an end date", () => {
    const { FinancialAccount } = resolver;

    const endDate = FinancialAccount.end(sampleData.account);
    expect(endDate).toEqual(sampleData.account.EndDate);
  });

  it("should return null if there are no transactions", () => {
    const { FinancialAccount } = resolver;

    const models = {
      Transaction: {
        findByAccountType() {
          return null;
        },
      },
    };

    const trans = FinancialAccount.transactions(
      { Id: 20, ParentAccountId: 30 },
      {},
      { models },
    );
    expect(trans).toEqual(null);
  });

  it("should return transaction details", async () => {
    const { FinancialAccount } = resolver;

    const models = {
      Transaction: {
        findByAccountType: jest.fn(() => Promise.resolve({})),
      },
    };

    const person = {
      PersonAliasId: 100,
      aliases: [22222],
    };

    // eslint-disable-next-line
    await FinancialAccount.transactions(
      { Id: 200, ParentAccountId: 300 },
      {
        limit: 3,
        skip: 1,
        cache: true,
        start: "2013-11-03",
        end: "2015-12-03",
      },
      { models, person },
    );
    expect(models.Transaction.findByAccountType).toBeCalledWith(
      {
        end: "2015-12-03",
        id: 200,
        include: [22222],
        parentId: 300,
        start: "2013-11-03",
      },
      { limit: 3, offset: 1 },
      { cache: true },
    );
  });

  it("should have a total", async () => {
    const { FinancialAccount } = resolver;

    const models = {
      Transaction: {
        findByAccountType: jest.fn(() => Promise.resolve([])),
      },
    };

    const person = {
      PersonAliasId: 100,
      aliases: [22222],
    };

    // eslint-disable-next-line
    await FinancialAccount.total(
      { Id: 200, ParentAccountId: 300 },
      {
        limit: 3,
        skip: 1,
        cache: true,
        start: "2013-11-03",
        end: "2015-12-03",
      },
      { models, person },
    );
    expect(models.Transaction.findByAccountType).toBeCalledWith(
      {
        end: "2015-12-03",
        id: 200,
        include: [22222],
        parentId: 300,
        start: "2013-11-03",
      },
      { limit: 3, offset: 1 },
      { cache: true },
    );
  });
});
