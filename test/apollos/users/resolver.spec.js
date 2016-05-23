
import { expect } from "chai";
import casual from "casual";
import Resolver from "../../../src/apollos/users/resolver";

describe("User resolvers", () => {

  const sampleData = {
    _id: casual.word,
    createdAt: new Date(casual.unix_time),
    services: {
      rock: {
        PersonId: casual.integer(0, 10000),
        PrimaryAliasId: casual.integer(0, 10000),
      },
      resume: {
        loginTokens: [
          {
            when: new Date(casual.unix_time),
            hashedToken: casual.word,
          },
          {
            when: new Date(casual.unix_time),
            hashedToken: casual.word,
          },
        ],
      },
    },
    emails: [
      {
        address: casual.email,
        verified: casual.random_value({ a: true, b: false }),
      },
    ],
  };

  describe("UserTokens", () => {

    it("should return the login token from the data", () => {
      const { UserTokens } = Resolver;

      const tokens = UserTokens.tokens(sampleData.services.resume);
      expect(tokens).to.deep.equal(sampleData.services.resume.loginTokens);

    });

  });

  describe("UserRock", () => {

    it("should return the 'Id' from the data", () => {
      const { UserRock } = Resolver;

      const id = UserRock.id(sampleData.services.rock);
      expect(id).to.equal(sampleData.services.rock.PersonId);
    });

    it("should return the 'PrimaryAliasId' from the data", () => {
      const { UserRock } = Resolver;

      const alias = UserRock.alias(sampleData.services.rock);
      expect(alias).to.equal(sampleData.services.rock.PrimaryAliasId);
    });

  });

  describe("UserService", () => {

    it("should return the 'rock' object from the data", () => {
      const { UserService } = Resolver;

      const rock = UserService.rock(sampleData.services);
      expect(rock).to.equal(sampleData.services.rock);
    });

    it("should return the 'resume' object from the data", () => {
      const { UserService } = Resolver;

      const resume = UserService.resume(sampleData.services);
      expect(resume).to.equal(sampleData.services.resume);
    });

  });

  describe("User", () => {

    it("should return the 'id' value from the data", () => {
      const { User } = Resolver;

      const id = User.id(sampleData);
      expect(id).to.equal(sampleData._id);
    });

    it("should return the 'services' object from the data", () => {
      const { User } = Resolver;

      const services = User.services(sampleData);
      expect(services).to.equal(sampleData.services);
    });

    it("should return the 'emails' object from the data", () => {
      const { User } = Resolver;

      const emails = User.emails(sampleData);
      expect(emails).to.equal(sampleData.emails);
    });

  });

});
