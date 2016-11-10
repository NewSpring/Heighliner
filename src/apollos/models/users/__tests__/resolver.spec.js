
import casual from "casual";
import Resolver from "../resolver";
import { parseGlobalId } from "../../../../util";

const sampleData = {
  _id: casual.word,
  createdAt: new Date(casual.unix_time),
  profile: {
    lastLogin: new Date(casual.unix_time),
  },
  services: {
    password: {
      bcrypt: casual.word,
    },
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


it("`UserTokens` should return the login token from the data", () => {
  const { UserTokens } = Resolver;

  const tokens = UserTokens.tokens(sampleData.services.resume);
  expect(tokens).toEqual(sampleData.services.resume.loginTokens);
});


it("`UserRock` should return the 'Id' from the data", () => {
  const { UserRock } = Resolver;

  const id = UserRock.id(sampleData.services.rock);
  expect(id).toEqual(sampleData.services.rock.PersonId);
});

it("`UserRock` should return the 'PrimaryAliasId' from the data", () => {
  const { UserRock } = Resolver;

  const alias = UserRock.alias(sampleData.services.rock);
  expect(alias).toEqual(sampleData.services.rock.PrimaryAliasId);
});

it("`UserService` should return the 'rock' object from the data", () => {
  const { UserService } = Resolver;

  const rock = UserService.rock(sampleData.services);
  expect(rock).toEqual(sampleData.services.rock);
});

it("`UserService` should return the 'resume' object from the data", () => {
  const { UserService } = Resolver;

  const resume = UserService.resume(sampleData.services);
  expect(resume).toEqual(sampleData.services.resume);
});

it("`User` should return the 'id' value from the data", () => {
  const { User } = Resolver;
  const parentType = { name: "User" };
  const { id } = parseGlobalId(User.id(sampleData, null, null, { parentType }));
  expect(id).toEqual(sampleData._id);
});

it("`User` should return the 'services' object from the data", () => {
  const { User } = Resolver;

  const services = User.services(sampleData);
  expect(services).toEqual(sampleData.services);
});

it("`User` should return the 'emails' object from the data", () => {
  const { User } = Resolver;

  const emails = User.emails(sampleData);
  expect(emails).toEqual(sampleData.emails);
});
