
import Resolver from "../resolver";

const sampleData = {
  Transaction: {
    id: 2,
    entityId: 3,
    summary: "sample summary",
    status: "sample status",
    date: "today",
    details: "Details Object",
    payment: "Payment Object",
    person: "12345-ABCDE",
    schedule: "Schedule Object",
    __type: "Transaction",
  },
  SavedPayment: {
    id: 4,
    entityId: 5,
    Name: "my saved payment",
    guid: "1234567890",
    code: "1234567812345678",
    date: "today",
    payment: "Payment Object",
    expirationMonth: "123456",
    expirationYear: "12345678",
    __type: "SavedPayment",
  },
  PaymentDetail: {
    id: 1,
    accountNumber: "1234567812345678",
    paymentType: "Credit Card",
  },
  person: {
    Id: "12345-ABCDE",
    FirstName: "John",
    LastName: "Doe",
    NickName: "Johnny",
    PhotoId: "12345-ABCDE",
    BirthDate: "1970-1-1T00:00:00.000Z",
    BirthDay: "17",
    BirthYear: "1984",
    BirthMonth: "10",
    Email: "email@example.com",
  },
};

describe("Feed Query", () => {
  const mockModels = {
    Transaction: {
      findByPersonAlias: jest.fn(),
    },
    SavedPayment: {
      findByPersonAlias: jest.fn(),
    },
  };

  afterEach(() => {
    mockModels.Transaction.findByPersonAlias.mockReset();
    mockModels.SavedPayment.findByPersonAlias.mockReset();
  });

  it("should return null with no person", () => {
    const { Query } = Resolver;

    const results = Query.userFeed(null, {}, { models: null, person: null });
    expect(results).toEqual(null);
  });

  it("should return null with no valid filters", () => {
    const { Query } = Resolver;

    const results = Query.userFeed(null, {}, { models: null, person: sampleData.person });
    const resultsWithFilter = Query.userFeed(null, { filters: ["INVALID"] }, { models: null, person: sampleData.person });
    expect(results).toEqual(null);
    expect(resultsWithFilter).toEqual(null);
  });

  it("return an empty object with invalid person id", async () => {
    const { Query } = Resolver;

    mockModels.Transaction.findByPersonAlias.mockReturnValueOnce([]);
    mockModels.SavedPayment.findByPersonAlias.mockReturnValueOnce([]);

    const results = await Query.userFeed( //eslint-disable-line
      null,
      { filters: ["GIVING_DASHBOARD"] },
      { models: mockModels, person: sampleData.person },
    );

    expect(results).toEqual([]);
  });

  it("should return array of combined Transaction and SavedPayment data", async () => {
    const { Query } = Resolver;

    mockModels.Transaction.findByPersonAlias.mockReturnValueOnce([sampleData.Transaction]);
    mockModels.SavedPayment.findByPersonAlias.mockReturnValueOnce([sampleData.SavedPayment]);

    const results = await Query.userFeed( //eslint-disable-line
      null,
      { filters: ["GIVING_DASHBOARD"] },
      { models: mockModels, person: sampleData.person },
    );

    expect(results).toMatchSnapshot();
    expect(results[0].__type).toEqual("Transaction");
    expect(results[1].__type).toEqual("SavedPayment");
  });
});
