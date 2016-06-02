
import test from "ava";
import crypto from "crypto";

import { User } from "../../../lib/apollos/users/model";

test("should expose the model as 'model'", t => {
  const users = new User();
  t.truthy(users.model);
});

test("`getByHashedToken` should allow searching for a raw token", async t => {
  let token = "testToken";
  const users = new User();
  users.model.findOne = function mockedFindOne(mongoQuery) {
    const matches = mongoQuery["$or"];

    for (let match of matches) {
      const tok = match["services.resume.loginTokens.hashedToken"];
      if (tok != token) {
        continue;
      }

      t.is(tok, token);
      return true;
    }

    // we should never get here
    t.fail();
  };

  return await users.getByHashedToken(token);
});

test("`getByHashedToken` should allow searching for an encrypted token", async t => {
  const token = "testToken";
  const users = new User();
  const encyptedToken = crypto.createHash("sha256")
    .update(token)
    .digest("base64");

  users.model.findOne = function mockedFindOne(mongoQuery) {
    const matches = mongoQuery["$or"];
    for (let match of matches) {
      const tok = match["services.resume.loginTokens.hashedToken"];
      if (tok != encyptedToken) {
        continue;
      }

      t.is(tok, encyptedToken);
      return true;
    }

    // we should never get here
    t.fail();
  };

  return await users.getByHashedToken(token);
});

test("`getFromId` should allow searching by an id", async t => {
  let id = "id";
  const users = new User();
  users.model.findOne = function mockedFindOne({ _id }) {
    t.is(_id, id);
    return {}
  };

  return await users.getFromId(id)
});

test("`getFromId` should try and read the data from the cache", async t => {
  let id = "id";

  const cache = {
    get(_id){
      t.is(_id, id);
      return {};
    },
  };

  const tempUsers = new User({ cache })

  tempUsers.model.findOne = function mockedFindOne({ _id }) {
    t.is(_id, id);
  };

  return await tempUsers.getFromId(id);
});
