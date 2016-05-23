
import { expect } from "chai";
import crypto from "crypto";

import Models from "../../../src/apollos/users/model";

describe("Users Model", () => {

  let users = new Models.Users();

  it("should expose the model as 'model'", () => {
    expect(users.model).to.exist;
  });

  describe("getByHashedToken", () => {
    let oldFindOne;
    beforeEach(() => {
      oldFindOne = users.model.findOne;
    });

    afterEach(() => {
      users.model.findOne = oldFindOne;
    });

    it("should allow searching for a raw token", (done) => {
      let token = "testToken";

      users.model.findOne = function mockedFindOne(mongoQuery) {
        const matches = mongoQuery["$or"];

        for (let match of matches) {
          const tok = match["services.resume.loginTokens.hashedToken"];
          if (tok != token) {
            continue;
          }

          expect(tok).to.equal(token);
          return true;
        }

        // we should never get here
        done(new Error("token not found"));
      };

      users.getByHashedToken(token)
        .then(() => { done(); });
    });

    it("should allow searching for an encrypted token", (done) => {
      const token = "testToken";

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

          expect(tok).to.equal(encyptedToken);
          return true;
        }

        // we should never get here
        done(new Error("token not found"));
      };

      users.getByHashedToken(token)
        .then(() => { done(); });
    });

  });

});
