
import { expect } from "chai";
import Mocks from "../../../lib/apollos/users/mocks";
import { mocks } from "../../../lib/apollos";

describe("User mocks", () => {

  describe("Hashes", () => {

    it("should have a 'when' key with a unix date", () => {
      const { Hashes } = Mocks;

      const hash = Hashes();
      const when = hash.when();

      expect(new Date(when)).to.be.instanceof(Date);
    });

  });

  describe("UserRock", () => {

    it("should have a postive integer as an 'id' field", () => {
      const { UserRock } = Mocks;

      const user = UserRock();
      const id = user.id();

      expect(id).to.be.above(0);
    });

    it("should have a postive integer as an 'alias' field", () => {
      const { UserRock } = Mocks;

      const user = UserRock();
      const alias = user.alias();

      expect(alias).to.be.above(0);
    });

  });

  describe("User", () => {

    it("should have a 'createdAt' key with a unix date", () => {
      const { User } = Mocks;

      const user = User();
      const createdAt = user.createdAt();

      expect(new Date(createdAt)).to.be.instanceof(Date);
    });

    it("should return an array of emails with an address", () => {
      const { User } = Mocks;

      const user = User();
      // this is a mocked list
      const email = user.emails().wrappedFunction();

      expect(email.address).to.match(/@/, "gmi");
    });

  });

  describe("Query", () => {

    it("should expose currentUser as part of the query", () => {
      const { Query } = mocks;

      const { currentUser } = Query();

      expect(currentUser).to.exist;
      expect(currentUser).to.be.a("function");
    });

  });

});
