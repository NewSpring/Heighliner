import { assign } from "lodash";

import {
  Transaction,
  FinancialPaymentDetail,
  FinancialAccount,
  TransactionDetail,
  ScheduledTransaction,
  FinancialBatch as FinancialBatchTable,
} from "../../tables";

import { Person, PersonAlias } from "../../../people/tables";

import { Group, GroupLocation, GroupMember } from "../../../groups/tables";

import { Location } from "../../../campuses/tables";

import submit from "../submit-transaction";

jest.mock("../../tables", () => ({
  Transaction: {
    find: jest.fn(() => Promise.resolve()),
    post: jest.fn(() => Promise.resolve()),
  },
  TransactionDetail: {
    post: jest.fn(() => Promise.resolve()),
  },
  FinancialPaymentDetail: {
    post: jest.fn(() => Promise.resolve()),
  },
  FinancialAccount: {
    findOne: jest.fn(() => Promise.resolve()),
  },
  ScheduledTransaction: {
    findOne: jest.fn(() => Promise.resolve()),
  },
  FinancialBatch: {
    find: jest.fn(() => Promise.resolve()),
    findOne: jest.fn(() => Promise.resolve()),
    post: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock("../../../people/tables", () => ({
  Person: {
    find: jest.fn(() => Promise.resolve()),
  },
  PersonAlias: {
    model: "PersonAlias",
  },
}));

jest.mock("../../../groups/tables", () => ({
  GroupLocation: {
    find: jest.fn(() => Promise.resolve()),
  },
  Group: {
    model: "Group",
  },
  GroupMember: {
    model: "GroupMember",
  },
}));

jest.mock("../../../campuses/tables", () => ({
  Location: {
    model: "Location",
  },
}));

let warn;
beforeEach(() => {
  warn = console.warn;
  console.warn = jest.fn();
});

afterEach(() => {
  console.warn = warn;
});

it("returns a promise", () => {
  expect(submit().then).toBeTruthy();
});

it("returns immediately if no transaction is passed", () =>
  submit().then((result) => {
    expect(result).toBeFalsy();
  }));

it("looks to see if the transaction is already in Rock", () => {
  const sample = {
    Transaction: {
      TransactionCode: "1",
    },
  };
  Transaction.find.mockReturnValueOnce(Promise.resolve([{ Id: "1" }]));
  return submit(sample).then(() => {
    expect(Transaction.find).toBeCalled();
    expect(Transaction.find).toBeCalledWith({
      where: { TransactionCode: "1" },
    });
  });
});

it("exits if the transaction is in Rock", () => {
  const sample = {
    Transaction: {
      TransactionCode: "1",
    },
  };
  Transaction.find.mockReturnValueOnce([{ Id: "1" }]);
  return submit(sample).then((result) => {
    expect(result).toBeFalsy();
    expect(Transaction.find).toBeCalled();
    expect(Transaction.find).toBeCalledWith({
      where: { TransactionCode: "1" },
    });
  });
});

it("tries to find a person record for the transaction", () => {
  const sample = {
    Transaction: {
      TransactionCode: "1",
    },
    Person: {
      LastName: "Cenva",
      Email: "norma.cenva@newspring.cc",
    },
  };
  Transaction.find.mockReturnValueOnce(Promise.resolve([]));
  Person.find.mockReturnValueOnce(Promise.resolve([]));
  return submit(sample).then((result) => {
    expect(result).toBeFalsy();
    expect(Transaction.find).toBeCalledWith({
      where: { TransactionCode: "1" },
    });
    expect(Person.find).toBeCalledWith({
      where: sample.Person,
      include: [{ model: PersonAlias.model }],
    });
  });
});

it("allows for manually setting the PersonId", () => {
  const sample = {
    Transaction: {
      TransactionCode: "1",
    },
    PaymentDetail: {
      AccountNumberMasked: "4***********1111",
      CreditCardTypeValueId: 7,
      CurrencyTypeValueId: 156,
      Guid: "a31044f3-d721-47b2-a91d-e58ac41832ad",
    },
    Person: {
      Id: 11,
      LastName: "Cenva",
      Email: "norma.cenva@newspring.cc",
    },
    Location: {
      Street1: "1 Linwa Blvd",
      Street2: undefined,
      City: "Anderson",
      State: "SC",
      PostalCode: "29621",
      Country: undefined,
    },
    TransactionDetails: [{ AccountId: 138 }, { AccountId: 128 }],
    CampusId: 1,
    ScheduledTransaction: {},
  };
  FinancialBatchTable.find.mockReturnValueOnce(Promise.resolve([]));
  Transaction.find.mockReturnValueOnce(Promise.resolve([]));
  Person.find.mockReturnValueOnce(
    Promise.resolve([
      { Id: 11, FirstName: "Norma", PersonAlias: { Id: 12 } },
      { Id: 2, FirstName: "Tissa", PersonAlias: { Id: 2 } },
    ]),
  );
  FinancialPaymentDetail.post.mockReturnValueOnce(Promise.resolve(5));
  Transaction.post.mockReturnValueOnce(Promise.resolve(100));
  FinancialAccount.findOne.mockReturnValueOnce(Promise.resolve(180));
  FinancialAccount.findOne.mockReturnValueOnce(Promise.resolve(120));

  return submit(sample).then(() => {
    expect(GroupLocation.find).not.toBeCalled();
    expect(FinancialPaymentDetail.post).toBeCalledWith(
      assign(sample.PaymentDetail, { CreatedByPersonAliasId: 12 }),
    );
  });
});

xit("it creates a person if none found");

it("trieds to narrow down person by location", () => {
  const sample = {
    Transaction: {
      TransactionCode: "1",
    },
    PaymentDetail: {
      AccountNumberMasked: "4***********1111",
      CreditCardTypeValueId: 7,
      CurrencyTypeValueId: 156,
      Guid: "a31044f3-d721-47b2-a91d-e58ac41832ad",
    },
    Person: {
      LastName: "Cenva",
      Email: "norma.cenva@newspring.cc",
    },
    Location: {
      Street1: "1 Linwa Blvd",
      Street2: undefined,
      City: "Anderson",
      State: "SC",
      PostalCode: "29621",
      Country: undefined,
    },
    TransactionDetails: [],
    ScheduledTransaction: {},
  };
  FinancialBatchTable.find.mockReturnValueOnce(Promise.resolve([]));
  Transaction.find.mockReturnValueOnce(Promise.resolve([]));
  Person.find.mockReturnValueOnce(
    Promise.resolve([
      { Id: 1, FirstName: "Norma", PersonAlias: { Id: 1 } },
      { Id: 2, FirstName: "Tissa", PersonAlias: { Id: 2 } },
    ]),
  );
  GroupLocation.find.mockReturnValueOnce(Promise.resolve([]));
  FinancialPaymentDetail.post.mockReturnValueOnce(Promise.resolve(5));
  Transaction.post.mockReturnValueOnce(Promise.resolve(100));
  const originalWarn = console.warn;
  console.warn = jest.fn();
  return submit(sample).then(() => {
    expect(console.warn).toBeCalledWith("no locations found for Norma,Tissa");
    console.warn = originalWarn;
    expect(GroupLocation.find).toBeCalledWith({
      include: [
        {
          model: Location.model,
          where: {
            Street1: sample.Location.Street1,
            City: sample.Location.City,
            State: sample.Location.State,
            PostalCode: sample.Location.PostalCode,
          },
        },
        {
          model: Group.model,
          where: { GroupTypeId: 10 },
          include: [
            {
              model: GroupMember.model,
              // XXX should this be an array of arrays?
              where: { PersonId: { $in: [[1, 2]] } },
            },
          ],
        },
      ],
    });
  });
});

it("trieds to narrow down person by location with found locations", () => {
  const sample = {
    Transaction: {
      TransactionCode: "1",
    },
    PaymentDetail: {
      AccountNumberMasked: "4***********1111",
      CreditCardTypeValueId: 7,
      CurrencyTypeValueId: 156,
      Guid: "a31044f3-d721-47b2-a91d-e58ac41832ad",
    },
    Person: {
      LastName: "Cenva",
      Email: "norma.cenva@newspring.cc",
    },
    Location: {
      Street1: "1 Linwa Blvd",
      Street2: undefined,
      City: "Anderson",
      State: "SC",
      PostalCode: "29621",
      Country: undefined,
    },
    TransactionDetails: [],
    ScheduledTransaction: {},
  };
  FinancialBatchTable.find.mockReturnValueOnce(Promise.resolve([]));
  Transaction.find.mockReturnValueOnce(Promise.resolve([]));
  Person.find.mockReturnValueOnce(
    Promise.resolve([
      { Id: 1, FirstName: "Norma", PersonAlias: { Id: 1 } },
      { Id: 2, FirstName: "Tissa", PersonAlias: { Id: 2 } },
    ]),
  );
  GroupLocation.find.mockReturnValueOnce(
    Promise.resolve([{ Group: { GroupMembers: [{ PersonId: 1 }] } }]),
  );
  FinancialPaymentDetail.post.mockReturnValueOnce(Promise.resolve(5));
  Transaction.post.mockReturnValueOnce(Promise.resolve(100));
  const originalWarn = console.warn;
  console.warn = jest.fn();
  return submit(sample).then(() => {
    expect(console.warn).not.toBeCalledWith("no locations found for Norma,Tissa");
    console.warn = originalWarn;
    expect(GroupLocation.find).toBeCalledWith({
      include: [
        {
          model: Location.model,
          where: {
            Street1: sample.Location.Street1,
            City: sample.Location.City,
            State: sample.Location.State,
            PostalCode: sample.Location.PostalCode,
          },
        },
        {
          model: Group.model,
          where: { GroupTypeId: 10 },
          include: [
            {
              model: GroupMember.model,
              // XXX should this be an array of arrays?
              where: { PersonId: { $in: [[1, 2]] } },
            },
          ],
        },
      ],
    });
  });
});

it("looks up the correct FinancialAccount based on CampusId", () => {
  const sample = {
    Transaction: {
      TransactionCode: "1",
    },
    PaymentDetail: {
      AccountNumberMasked: "4***********1111",
      CreditCardTypeValueId: 7,
      CurrencyTypeValueId: 156,
      Guid: "a31044f3-d721-47b2-a91d-e58ac41832ad",
    },
    Person: {
      LastName: "Cenva",
      Email: "norma.cenva@newspring.cc",
    },
    Location: {
      Street1: "1 Linwa Blvd",
      Street2: undefined,
      City: "Anderson",
      State: "SC",
      PostalCode: "29621",
      Country: undefined,
    },
    TransactionDetails: [{ AccountId: 138 }, { AccountId: 128 }],
    CampusId: 1,
    ScheduledTransaction: {},
  };
  FinancialBatchTable.find.mockReturnValueOnce(Promise.resolve([]));
  Transaction.find.mockReturnValueOnce(Promise.resolve([]));
  Person.find.mockReturnValueOnce(
    Promise.resolve([
      { Id: 1, FirstName: "Norma", PersonAlias: { Id: 1 } },
      { Id: 2, FirstName: "Tissa", PersonAlias: { Id: 2 } },
    ]),
  );
  GroupLocation.find.mockReturnValueOnce(Promise.resolve([]));
  FinancialPaymentDetail.post.mockReturnValueOnce(Promise.resolve(5));
  Transaction.post.mockReturnValueOnce(Promise.resolve(100));
  FinancialAccount.findOne.mockReturnValueOnce(Promise.resolve(180));
  FinancialAccount.findOne.mockReturnValueOnce(Promise.resolve(120));

  return submit(sample).then(({ Id }) => {
    expect(FinancialAccount.findOne).toBeCalledWith({
      where: { CampusId: sample.CampusId, ParentAccountId: 138 },
    });

    expect(FinancialAccount.findOne).toBeCalledWith({
      where: { CampusId: sample.CampusId, ParentAccountId: 128 },
    });

    expect(Id).toEqual(100);
  });
});

it("creates a financial payment", () => {
  const sample = {
    Transaction: {
      TransactionCode: "1",
    },
    PaymentDetail: {
      AccountNumberMasked: "4***********1111",
      CreditCardTypeValueId: 7,
      CurrencyTypeValueId: 156,
      Guid: "a31044f3-d721-47b2-a91d-e58ac41832ad",
    },
    Person: {
      LastName: "Cenva",
      Email: "norma.cenva@newspring.cc",
    },
    Location: {
      Street1: "1 Linwa Blvd",
      Street2: undefined,
      City: "Anderson",
      State: "SC",
      PostalCode: "29621",
      Country: undefined,
    },
    TransactionDetails: [],
    ScheduledTransaction: {},
  };
  FinancialBatchTable.find.mockReturnValueOnce(Promise.resolve([]));
  Transaction.find.mockReturnValueOnce(Promise.resolve([]));
  Person.find.mockReturnValueOnce(
    Promise.resolve([
      { Id: 1, FirstName: "Norma", PersonAlias: { Id: 1 } },
      { Id: 2, FirstName: "Tissa", PersonAlias: { Id: 2 } },
    ]),
  );
  GroupLocation.find.mockReturnValueOnce(Promise.resolve([]));
  FinancialPaymentDetail.post.mockReturnValueOnce(Promise.resolve(5));
  Transaction.post.mockReturnValueOnce(Promise.resolve(100));

  return submit(sample).then(() => {
    expect(FinancialPaymentDetail.post).toBeCalledWith(
      assign(sample.PaymentDetail, { CreatedByPersonAliasId: 1 }),
    );
  });
});

xit("it batches the rest of the actions if failure on creating a finanical payment");

it("attaches the ScheduledTransactionId if needed", () => {
  const sample = {
    Transaction: {
      TransactionCode: "1",
    },
    PaymentDetail: {
      AccountNumberMasked: "4***********1111",
      CreditCardTypeValueId: 7,
      CurrencyTypeValueId: 156,
      Guid: "a31044f3-d721-47b2-a91d-e58ac41832ad",
    },
    Person: {
      LastName: "Cenva",
      Email: "norma.cenva@newspring.cc",
    },
    Location: {
      Street1: "1 Linwa Blvd",
      Street2: undefined,
      City: "Anderson",
      State: "SC",
      PostalCode: "29621",
      Country: undefined,
    },
    TransactionDetails: [{ AccountId: 138 }, { AccountId: 128 }],
    CampusId: 1,
    ScheduledTransaction: {
      GatewayScheduleId: "19",
    },
  };
  FinancialBatchTable.find.mockReturnValueOnce(Promise.resolve([]));
  Transaction.find.mockReturnValueOnce(Promise.resolve([]));
  Person.find.mockReturnValueOnce(
    Promise.resolve([
      { Id: 1, FirstName: "Norma", PersonAlias: { Id: 1 } },
      { Id: 2, FirstName: "Tissa", PersonAlias: { Id: 2 } },
    ]),
  );
  GroupLocation.find.mockReturnValueOnce(Promise.resolve([]));
  FinancialPaymentDetail.post.mockReturnValueOnce(Promise.resolve(5));
  Transaction.post.mockReturnValueOnce(Promise.resolve(100));
  FinancialAccount.findOne.mockReturnValueOnce(Promise.resolve(180));
  FinancialAccount.findOne.mockReturnValueOnce(Promise.resolve(120));
  ScheduledTransaction.findOne.mockReturnValueOnce(
    Promise.resolve({
      Id: 24,
    }),
  );
  return submit(sample).then(() => {
    expect(ScheduledTransaction.findOne).toBeCalledWith({
      where: sample.ScheduledTransaction,
    });
    expect(Transaction.post).toBeCalledWith(
      assign(sample.Transaction, {
        AuthorizedPersonAliasId: 1,
        CreatedByPersonAliasId: 1,
        FinancialPaymentDetailId: 5,
        ScheduledTransactionId: 24,
      }),
    );
  });
});

it("logs an error if missing a schedule in Rock", () => {
  const sample = {
    Transaction: {
      TransactionCode: "1",
    },
    PaymentDetail: {
      AccountNumberMasked: "4***********1111",
      CreditCardTypeValueId: 7,
      CurrencyTypeValueId: 156,
      Guid: "a31044f3-d721-47b2-a91d-e58ac41832ad",
    },
    Person: {
      Id: 1,
      LastName: "Cenva",
      Email: "norma.cenva@newspring.cc",
    },
    Location: {
      Street1: "1 Linwa Blvd",
      Street2: undefined,
      City: "Anderson",
      State: "SC",
      PostalCode: "29621",
      Country: undefined,
    },
    TransactionDetails: [{ AccountId: 138 }, { AccountId: 128 }],
    CampusId: 1,
    ScheduledTransaction: {
      GatewayScheduleId: "19",
    },
  };
  FinancialBatchTable.find.mockReturnValueOnce(Promise.resolve([]));
  Transaction.find.mockReturnValueOnce(Promise.resolve([]));
  Person.find.mockReturnValueOnce(
    Promise.resolve([
      { Id: 1, FirstName: "Norma", PersonAlias: { Id: 1 } },
      { Id: 2, FirstName: "Tissa", PersonAlias: { Id: 2 } },
    ]),
  );
  FinancialPaymentDetail.post.mockReturnValueOnce(Promise.resolve(5));
  Transaction.post.mockReturnValueOnce(Promise.resolve(100));
  FinancialAccount.findOne.mockReturnValueOnce(Promise.resolve(180));
  FinancialAccount.findOne.mockReturnValueOnce(Promise.resolve(120));
  ScheduledTransaction.findOne.mockReturnValueOnce(Promise.resolve());
  const originalError = console.error;
  console.error = jest.fn();
  return submit(sample).then(() => {
    expect(ScheduledTransaction.findOne).toBeCalledWith({
      where: sample.ScheduledTransaction,
    });
    expect(console.error.mock.calls[0]).toMatchSnapshot();
    console.error = originalError;
    expect(Transaction.post).toBeCalledWith(
      assign(sample.Transaction, {
        AuthorizedPersonAliasId: 1,
        CreatedByPersonAliasId: 1,
        FinancialPaymentDetailId: 5,
      }),
    );
  });
});

it("creates a FinancialTransaction", () => {
  const sample = {
    Transaction: {
      TransactionCode: "1",
    },
    PaymentDetail: {
      AccountNumberMasked: "4***********1111",
      CreditCardTypeValueId: 7,
      CurrencyTypeValueId: 156,
      Guid: "a31044f3-d721-47b2-a91d-e58ac41832ad",
    },
    Person: {
      LastName: "Cenva",
      Email: "norma.cenva@newspring.cc",
    },
    Location: {
      Street1: "1 Linwa Blvd",
      Street2: undefined,
      City: "Anderson",
      State: "SC",
      PostalCode: "29621",
      Country: undefined,
    },
    TransactionDetails: [],
    ScheduledTransaction: {},
  };
  FinancialBatchTable.find.mockReturnValueOnce(Promise.resolve([]));
  Transaction.find.mockReturnValueOnce(Promise.resolve([]));
  Person.find.mockReturnValueOnce(
    Promise.resolve([
      { Id: 1, FirstName: "Norma", PersonAlias: { Id: 1 } },
      { Id: 2, FirstName: "Tissa", PersonAlias: { Id: 2 } },
    ]),
  );
  GroupLocation.find.mockReturnValueOnce(Promise.resolve([]));
  FinancialPaymentDetail.post.mockReturnValueOnce(Promise.resolve(5));
  Transaction.post.mockReturnValueOnce(Promise.resolve(100));

  return submit(sample).then(() => {
    expect(Transaction.post).toBeCalledWith(
      assign(sample.Transaction, {
        AuthorizedPersonAliasId: 1,
        CreatedByPersonAliasId: 1,
        FinancialPaymentDetailId: 5,
      }),
    );
  });
});

xit("it batches the rest of the actions if failure on creating a transaction");

it("creates TransactionDetail entities", () => {
  const sample = {
    Transaction: {
      TransactionCode: "1",
    },
    PaymentDetail: {
      AccountNumberMasked: "4***********1111",
      CreditCardTypeValueId: 7,
      CurrencyTypeValueId: 156,
      Guid: "a31044f3-d721-47b2-a91d-e58ac41832ad",
    },
    Person: {
      LastName: "Cenva",
      Email: "norma.cenva@newspring.cc",
    },
    Location: {
      Street1: "1 Linwa Blvd",
      Street2: undefined,
      City: "Anderson",
      State: "SC",
      PostalCode: "29621",
      Country: undefined,
    },
    TransactionDetails: [{ AccountId: 138 }, { AccountId: 128 }],
    CampusId: 1,
    ScheduledTransaction: {},
  };
  FinancialBatchTable.find.mockReturnValueOnce(Promise.resolve([]));
  Transaction.find.mockReturnValueOnce(Promise.resolve([]));
  Person.find.mockReturnValueOnce(
    Promise.resolve([
      { Id: 1, FirstName: "Norma", PersonAlias: { Id: 1 } },
      { Id: 2, FirstName: "Tissa", PersonAlias: { Id: 2 } },
    ]),
  );
  GroupLocation.find.mockReturnValueOnce(Promise.resolve([]));
  FinancialPaymentDetail.post.mockReturnValueOnce(Promise.resolve(5));
  Transaction.post.mockReturnValueOnce(Promise.resolve(100));
  FinancialAccount.findOne.mockReturnValueOnce(Promise.resolve(180));
  FinancialAccount.findOne.mockReturnValueOnce(Promise.resolve(120));

  return submit(sample).then(() => {
    expect(TransactionDetail.post).toBeCalledWith(
      assign(sample.TransactionDetails[0], {
        TransactionId: 100,
        CreatedByPersonAliasId: 1,
        AccountId: 180,
      }),
    );

    expect(TransactionDetail.post).toBeCalledWith(
      assign(sample.TransactionDetails[1], {
        TransactionId: 100,
        CreatedByPersonAliasId: 1,
        AccountId: 120,
      }),
    );
  });
});

xit("it batches creating all TransactionDetails if failure");

it("returns the FinancialTransactionId", () => {
  const sample = {
    Transaction: {
      TransactionCode: "1",
      TransactionDateTime: "2017-10-16 11:53:32.240",
    },
    PaymentDetail: {
      AccountNumberMasked: "4***********1111",
      CreditCardTypeValueId: 7,
      CurrencyTypeValueId: 156,
      Guid: "a31044f3-d721-47b2-a91d-e58ac41832ad",
    },
    Person: {
      LastName: "Cenva",
      Email: "norma.cenva@newspring.cc",
    },
    Location: {
      Street1: "1 Linwa Blvd",
      Street2: undefined,
      City: "Anderson",
      State: "SC",
      PostalCode: "29621",
      Country: undefined,
    },
    TransactionDetails: [{ AccountId: 138 }, { AccountId: 128 }],
    CampusId: 1,
    ScheduledTransaction: {},
  };
  FinancialBatchTable.find.mockReturnValueOnce(Promise.resolve([]));
  Transaction.find.mockReturnValueOnce(Promise.resolve([]));
  Person.find.mockReturnValueOnce(
    Promise.resolve([
      { Id: 1, FirstName: "Norma", PersonAlias: { Id: 1 } },
      { Id: 2, FirstName: "Tissa", PersonAlias: { Id: 2 } },
    ]),
  );
  GroupLocation.find.mockReturnValueOnce(Promise.resolve([]));
  FinancialPaymentDetail.post.mockReturnValueOnce(Promise.resolve(5));
  Transaction.post.mockReturnValueOnce(Promise.resolve(100));
  FinancialAccount.findOne.mockReturnValueOnce(Promise.resolve(180));
  FinancialAccount.findOne.mockReturnValueOnce(Promise.resolve(120));

  return submit(sample).then(({ Id }) => {
    expect(Id).toBe(100);
  });
});

xit("it returns a MutationResponse with a node of FinancialTransaction");
