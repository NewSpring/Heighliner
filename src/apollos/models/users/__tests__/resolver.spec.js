
import casual from "casual";
import Resolver from "../resolver";
import { FOLLOWABLE_TOPICS } from "../../../../constants";

const sampleUser = {
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

const samplePerson = {
  Email: casual.email,
  PrimaryAliasId: casual.integer(0, 10000),
};

const mockModels = {
  User: {
    getUserFollowingTopics: jest.fn(),
    toggleTopic: jest.fn(),
  },
};

it("has a currentUser root level query which pulls from the context", () => {
  const { currentUser } = Resolver.Query;
  expect(currentUser(null, null, { user: "TEST", person: "TEST" })).toEqual({ user: "TEST", person: "TEST" });
  expect(currentUser(null, null, {})).toBe(null);
});

it("`UserTokens` should return the login token from the data", () => {
  const { UserTokens } = Resolver;

  const tokens = UserTokens.tokens(sampleUser.services.resume);
  expect(tokens).toEqual(sampleUser.services.resume.loginTokens);
});


it("`UserRock` should return the 'Id' from the data", () => {
  const { UserRock } = Resolver;

  const id = UserRock.id(sampleUser.services.rock);
  expect(id).toEqual(sampleUser.services.rock.PersonId);
});

it("`UserRock` should return the 'PrimaryAliasId' from the data", () => {
  const { UserRock } = Resolver;

  const alias = UserRock.alias(sampleUser.services.rock);
  expect(alias).toEqual(sampleUser.services.rock.PrimaryAliasId);
});

it("`UserService` should return the 'rock' object from the data", () => {
  const { UserService } = Resolver;

  const rock = UserService.rock(sampleUser.services);
  expect(rock).toEqual(sampleUser.services.rock);
});

it("`UserService` should return the 'resume' object from the data", () => {
  const { UserService } = Resolver;

  const resume = UserService.resume(sampleUser.services);
  expect(resume).toEqual(sampleUser.services.resume);
});

it("`User` should return the 'id' value from the data", () => {
  const { User } = Resolver;
  const id = User.id({ user: sampleUser });
  expect(id).toEqual(sampleUser._id);
});

it("`User` should return the 'services' object from the data", () => {
  const { User } = Resolver;

  const services = User.services({ user: sampleUser });
  expect(services).toEqual(sampleUser.services);
});

it("`User` should return the 'emails' object from the data", () => {
  const { User } = Resolver;

  const emails = User.emails({ user: sampleUser });
  expect(emails).toEqual(sampleUser.emails);
});

it("`User` should return 'email' from deprecated data", () => {
  const { User } = Resolver;

  const email = User.email({ user: sampleUser });
  expect(email).toEqual(sampleUser.emails[0].address);
});

it("`User` should return 'email' from rock", () => {
  const { User } = Resolver;

  const email = User.email({ person: samplePerson });
  expect(email).toEqual(samplePerson.Email);
});

it("`User` should call 'getUserFollowingTopics' with 'PrimaryAliasId' for 'followedTopics'", () => {
  const { User } = Resolver;

  User.followedTopics({ person: samplePerson }, null, { models: mockModels });

  expect(mockModels.User.getUserFollowingTopics).toBeCalledWith(samplePerson.PrimaryAliasId);
});

it("Mutation `toggleTopic` should call 'toggleTopic' from 'User'", () => {
  const { Mutation } = Resolver;

  Mutation.toggleTopic(null, { topic: "Articles" }, { models: mockModels, person: samplePerson });

  expect(mockModels.User.toggleTopic).toBeCalledWith({
    topic: "Articles",
    userId: samplePerson.PrimaryAliasId,
  });
});

it("`topics` should return all 'FOLLOWABLE_TOPICS'", () => {
  const { Query } = Resolver;

  const followableTopics = Query.topics();

  expect(followableTopics).toEqual(FOLLOWABLE_TOPICS);
});
