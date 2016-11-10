
import resolver from "../resolver";


describe("Mutation", () => {
  it("has a `syncTransactions` method", () => {
    expect(resolver.Mutation.syncTransactions).toBeTruthy();
  });

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
