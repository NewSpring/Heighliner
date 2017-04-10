
import Resolver from "../resolver";

describe("requestGroupInfo", () => {
  beforeEach(() => {

  });

  it("should return 401 with no person", async () => {
    const { requestGroupInfo } = Resolver.Mutation;
    const res = await requestGroupInfo(null, {}, {});
    expect(res).toEqual({
      code: 401, error: "Must be logged in to make this request", success: false,
    });
  });

  it("should call model function properly if person", async () => {
    const models = { Group: { requestGroupInfo: jest.fn() } };
    const { requestGroupInfo } = Resolver.Mutation;
    await requestGroupInfo(null, {
      communicationPreference: "banana", groupId: 1234, message: "i miss harambe",
    }, { models, person: "person" });
    expect(models.Group.requestGroupInfo).toHaveBeenCalledWith({
      communicationPreference: "banana", groupId: 1234, message: "i miss harambe",
    }, "person");
  });
});

describe("GroupSchedule", () => {
  const sampleGroup = {
    Id: 51317,
    Description: "Special Group for May 13",
    Name: "Special Group",
    WeeklyDayOfWeek: 4,
    WeeklyTimeOfDay: "1970-01-01T16:00:00.000Z",
  };

  it("passes date and time correctly", () => {
    const { GroupSchedule } = Resolver;
    const description = GroupSchedule.description(sampleGroup);
    expect(description).toEqual("Thursday @ 4:00 PM");
  });

  it("handles sunday correctly", () => {
    const { GroupSchedule } = Resolver;
    const sundayGroup = sampleGroup;
    sundayGroup.WeeklyDayOfWeek = 0;
    const description = GroupSchedule.description(sundayGroup);
    expect(description).toEqual("Sunday @ 4:00 PM");
  });
});
