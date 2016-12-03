
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
});
