
import test from "ava";
import Mocks from "../../../lib/apollos/users/mocks";
import { mocks } from "../../../lib/apollos";

test("Hashes should have a 'when' key with a unix date", t => {
  const { Hashes } = Mocks;

  const hash = Hashes();
  const when = hash.when();

  t.true(new Date(when) instanceof Date);
});

test("UserRock should have a postive integer as an 'id' field", t => {
  const { UserRock } = Mocks;

  const user = UserRock();
  const id = user.id();

  t.true(id > 0);
});

test("UserRock should have a postive integer as an 'alias' field", t => {
  const { UserRock } = Mocks;

  const user = UserRock();
  const alias = user.alias();

  t.true(alias > 0);
});

test("User should have a 'createdAt' key with a unix date", t => {
  const { User } = Mocks;

  const user = User();
  const createdAt = user.createdAt();

  t.true(new Date(createdAt) instanceof Date);
});

test("User should return an array of emails with an address", t => {
  const { User } = Mocks;

  const user = User();
  const email = user.emails()[0];

  t.true(/@/.test(email.address));
});

test("Query should expose currentUser as part of the query", t => {
  const { Query } = mocks;

  const { currentUser } = Query;

  t.truthy(currentUser);
  t.is(typeof currentUser, "function");

});
