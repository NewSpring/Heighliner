import format from "../formatTransaction";

import {
  singleTransaction,
  singleACHTransaction,
  scheduleTransaction,
  multiFundScheduleTransaction,
  multipleTransactions,
} from "../__mocks__/sample-response";

jest.mock("moment", () => date => ({
  toISOString: () => `Mocked ISODate: ${date}`,
  subtract: (number, size) => `Mocked subtract ${number}, ${size}`,
}));

jest.mock("node-uuid", () => ({
  v4: jest.fn(() => "guid"),
}));

it("handles standard response data", () => {
  expect(
    format(
      {
        response: singleTransaction,
      },
      { Id: 3 },
    ),
  ).toMatchSnapshot();
});

it("handles multipleTransactions", () => {
  expect(
    format(
      {
        response: multipleTransactions,
      },
      { Id: 3 },
    ),
  ).toMatchSnapshot();
});

it("handles an authenticated response", () => {
  expect(
    format(
      {
        response: singleTransaction,
        person: { Id: 1, PrimaryAliasId: 2 },
      },
      { Id: 3 },
    ),
  ).toMatchSnapshot();
});

it("handles adding a saved account", () => {
  expect(
    format(
      {
        response: singleTransaction,
        person: { Id: 1, PrimaryAliasId: 2 },
        accountName: "My Credit Card",
      },
      { Id: 3 },
    ),
  ).toMatchSnapshot();
});

it("maps the source type value", () => {
  expect(
    format(
      {
        response: singleTransaction,
        origin: "http://example.com/give",
      },
      { Id: 3 },
    ),
  ).toMatchSnapshot();
});

it("sets the schedule Id to be recovered", () => {
  expect(
    format(
      {
        response: singleTransaction,
        scheduleId: 10,
      },
      { Id: 3 },
    ),
  ).toMatchSnapshot();
});

it("handles an ACH transaction", () => {
  expect(
    format(
      {
        response: singleACHTransaction,
      },
      { Id: 3 },
    ),
  ).toMatchSnapshot();
});

it("handles a schedule", () => {
  expect(
    format(
      {
        response: scheduleTransaction,
        scheduleId: 10,
      },
      { Id: 3 },
    ),
  ).toMatchSnapshot();
});

it("handles a schedule with multipleTransactions", () => {
  expect(
    format(
      {
        response: multiFundScheduleTransaction,
      },
      { Id: 3 },
    ),
  ).toMatchSnapshot();
});
