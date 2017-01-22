
import Resolver from "../resolver";

describe("Likes Mutation", () => {
  const mockUser = { _id: "12345" };
  const mockModels = {
    Like: {
      toggleLike: jest.fn(),
    },
    Node: {},
  };

  afterEach(() => {
    mockModels.Like.toggleLike.mockReset();
  });

  it("should return empty array with improper input", () => {
    const toggleLike = Resolver.Mutation.toggleLike;

    let res = toggleLike(null, {nodeId: "1234"}, {});
    expect(res).toEqual([]);
  });

  it("should call toggleLike with the correct args", () => {
    const toggleLike = Resolver.Mutation.toggleLike;

    const res = toggleLike(null, { nodeId: "1234" }, { models: mockModels, user: mockUser});
    expect(mockModels.Like.toggleLike).toHaveBeenCalledWith("1234", "12345", {});
  });
});
