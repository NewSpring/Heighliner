
import resolver from "../resolver";


describe("Mutation", () => {
  describe("syncTransactions", () => {
    it("has a `syncTransactions` which passes args to Transaction.syncTransactions", () => {
      const models = {
        Transaction: {
          syncTransactions: jest.fn(),
        },
      };
      resolver.Mutation.syncTransactions(null, { foo: "bar" }, { models });
      expect(models.Transaction.syncTransactions).toBeCalledWith({ foo: "bar" });
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
      await resolver.Mutation.cancelSavedPayment(null, { entityId: 1, gateway: "nmi" }, { models });
      expect(models.Transaction.loadGatewayDetails).toBeCalledWith("nmi");
      expect(models.SavedPayment.removeFromEntityId).toBeCalledWith(1, { nmi: true });
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
          data: "{ \"foo\": true }",
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
      }, { Id: 1 });
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
      await resolver.Mutation.validate(null, { token: "token", gateway: "nmi" }, { models });
      expect(models.Transaction.loadGatewayDetails).toBeCalledWith("nmi");
      expect(models.SavedPayment.validate).toBeCalledWith({ token: "token" }, { nmi: true });
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
        null, { token: "token", gateway: "nmi" }, { models },
      );
      expect(models.Transaction.loadGatewayDetails).toBeCalledWith("nmi");
      expect(models.SavedPayment.validate).toBeCalledWith({ token: "token" }, { nmi: true });
      expect(result).toEqual({ error: "failure", code: undefined, success: false });
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

      expect(models.Transaction.completeOrder).toBeCalledWith(
        {
          token: "token",
          accountName: "card",
          person: { Id: 1 },
          origin: "https://example.com",
          scheduleId: 1,
        },
      );
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

      expect(models.Transaction.completeOrder).toBeCalledWith(
        {
          token: "token",
          accountName: "card",
          person: { Id: 1 },
          origin: "https://example.com",
          scheduleId: 1,
        },
      );
      expect(result).toEqual({ error: "failure", code: undefined, success: false });
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
      expect(models.SavedPayment.save).toBeCalledWith({
        token: "token",
        name: "visa",
        person: { Id: 1 },
      }, { nmi: true });
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
      await resolver.Mutation.cancelSchedule(null, { entityId: 1, gateway: "nmi" }, { models });
      expect(models.Transaction.loadGatewayDetails).toBeCalledWith("nmi");
      expect(models.ScheduledTransaction.cancelNMISchedule).toBeCalledWith(1, { nmi: true });
    });
    it("gracefully handles errors", async () => {
      const models = {
        Transaction: {
          loadGatewayDetails: jest.fn(() => Promise.resolve({ nmi: true })),
        },
        ScheduledTransaction: {
          cancelNMISchedule: jest.fn(() => Promise.reject(new Error("failure"))),
        },
      };
      const result = await resolver.Mutation.cancelSchedule(null, { entityId: 1, gateway: "nmi" }, { models });
      expect(models.Transaction.loadGatewayDetails).toBeCalledWith("nmi");
      expect(models.ScheduledTransaction.cancelNMISchedule).toBeCalledWith(1, { nmi: true });
      expect(result).toEqual({ error: "failure", code: undefined, success: false });
    });
  });
});
