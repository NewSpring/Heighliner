
import Mocks from "../mocks";
import { mocks } from "../../../";

it("Hashes should have a 'when' key with a unix date", () => {
  const { Hashes } = Mocks;

  const hash = Hashes();
  const when = hash.when();

  expect(new Date(when) instanceof Date).toBeTruthy();
});

it("UserRock should have a postive integer as an 'id' field", () => {
  const { UserRock } = Mocks;

  const user = UserRock();
  const id = user.id();

  expect(id > 0).toBeTruthy();
});

it("UserRock should have a postive integer as an 'alias' field", () => {
  const { UserRock } = Mocks;

  const user = UserRock();
  const alias = user.alias();

  expect(alias > 0).toBeTruthy();
});

it("User should have a 'createdAt' key with a unix date", () => {
  const { User } = Mocks;

  const user = User();
  const createdAt = user.createdAt();

  expect(new Date(createdAt) instanceof Date).toBeTruthy();
});

it("User should return an array of emails with an address", () => {
  const { User } = Mocks;

  const user = User();
  const email = user.emails()[0];

  expect(/@/.test(email.address)).toBeTruthy();
});

it("Query should expose currentUser as part of the query", () => {
  const { Query } = mocks;

  const { currentUser } = Query;

  expect(currentUser).toBeTruthy();
  expect(typeof currentUser).toEqual("function");
});
