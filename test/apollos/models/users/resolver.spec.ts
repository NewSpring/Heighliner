
import test from "ava";
import casual from "casual";
import Resolver from "../../../../src/apollos/models/users/resolver";
import { parseGlobalId } from "../../../../src/util";

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


test("`UserTokens` should return the login token from the data", t => {
  const { UserTokens } = Resolver;

  const tokens = UserTokens.tokens(sampleData.services.resume);
  t.deepEqual(tokens, sampleData.services.resume.loginTokens);
});


test("`UserRock` should return the 'Id' from the data", t => {
  const { UserRock } = Resolver;

  const id = UserRock.id(sampleData.services.rock);
  t.is(id, sampleData.services.rock.PersonId);
});

test("`UserRock` should return the 'PrimaryAliasId' from the data", t => {
  const { UserRock } = Resolver;

  const alias = UserRock.alias(sampleData.services.rock);
  t.is(alias, sampleData.services.rock.PrimaryAliasId);
});

test("`UserService` should return the 'rock' object from the data", t => {
  const { UserService } = Resolver;

  const rock = UserService.rock(sampleData.services);
  t.is(rock, sampleData.services.rock);
});

test("`UserService` should return the 'resume' object from the data", t => {
  const { UserService } = Resolver;

  const resume = UserService.resume(sampleData.services);
  t.is(resume, sampleData.services.resume);
});

test("`User` should return the 'id' value from the data", t => {
  const { User } = Resolver;
  const parentType = { name: "User" };
  const { id } = parseGlobalId(User.id(sampleData, null, null, { parentType }));
  t.is(id, sampleData._id);
});

test("`User` should return the 'services' object from the data", t => {
  const { User } = Resolver;

  const services = User.services(sampleData);
  t.is(services, sampleData.services);
});

test("`User` should return the 'emails' object from the data", t => {
  const { User } = Resolver;

  const emails = User.emails(sampleData);
  t.is(emails, sampleData.emails);
});
