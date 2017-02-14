import Resolver from "../resolver";

describe("requestGroupInfo", () => {
  beforeEach(() => {});

  it("should return 401 with no person", async () => {
    const { requestGroupInfo } = Resolver.Mutation;
    const res = await requestGroupInfo(null, {}, {});
    expect(res).toEqual({
      code: 401,
      error: "Must be logged in to make this request",
      success: false,
    });
  });

  it("should call model function properly if person", async () => {
    const models = { Group: { requestGroupInfo: jest.fn() } };
    const { requestGroupInfo } = Resolver.Mutation;
    await requestGroupInfo(
      null,
      {
        communicationPreference: "banana",
        groupId: 1234,
        message: "i miss harambe",
      },
      { models, person: "person" },
    );
    expect(models.Group.requestGroupInfo).toHaveBeenCalledWith(
      {
        communicationPreference: "banana",
        groupId: 1234,
        message: "i miss harambe",
      },
      "person",
    );
  });
});
