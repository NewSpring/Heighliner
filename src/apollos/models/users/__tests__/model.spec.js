import crypto from "crypto";
import { User } from "../model";

it("should expose the model", () => {
  const users = new User();
  expect(users.model).toBeTruthy();
});

it("`getByHashedToken` should allow searching for a raw token", async () => {
  const token = "testToken";
  const users = new User();
  users.model.findOne = function mockedFindOne(mongoQuery) {
    const matches = mongoQuery.$or;

    for (const match of matches) {
      const tok = match["services.resume.loginTokens.hashedToken"];
      if (tok !== token) continue;

      expect(tok).toEqual(token);
      return Promise.resolve({});
    }

    // we should never get here
    throw new Error();
  };

  return await users.getByHashedToken(token);
});

it(
  "`getByHashedToken` should allow searching for an encrypted token",
  async () => {
    const token = "testToken";
    const users = new User();
    const encyptedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("base64");

    users.model.findOne = function mockedFindOne(mongoQuery) {
      const matches = mongoQuery.$or;
      for (const match of matches) {
        const tok = match["services.resume.loginTokens.hashedToken"];
        if (tok !== encyptedToken) continue;

        expect(tok).toEqual(encyptedToken);
        return Promise.resolve({});
      }

      // we should never get here
      throw new Error();
    };

    return await users.getByHashedToken(token);
  },
);

xit("`getFromId` should allow searching by an id", async () => {
  const id = "id";
  const users = new User();
  users.model.findOne = function mockedFindOne({ _id }) {
    expect(_id).toEqual(id);
    return Promise.resolve({});
  };

  return await users.getFromId(id, null);
});

it(
  "`getFromId` should try and read the data from the cache using the globalId",
  async () => {
    const id = "id";
    const globalId = "foo";

    const cache = {
      get(global) {
        expect(globalId).toEqual(global);
        return Promise.resolve();
      },
    };

    const tempUsers = new User({ cache });

    return await tempUsers.getFromId(id, globalId);
  },
);
