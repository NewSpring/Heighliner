import Resolver from "../resolver";

const mockUser = { _id: "12345" };
const mockModels = {
  Like: {
    toggleLike: jest.fn(),
    getRecentlyLiked: jest.fn(),
  },
  Node: {},
};

describe("Likes Mutation", () => {
  afterEach(() => {
    mockModels.Like.toggleLike.mockReset();
  });

  it("should return empty array with improper input", () => {
    const toggleLike = Resolver.Mutation.toggleLike;

    const res = toggleLike(null, { nodeId: "1234" }, {});
    expect(res).toEqual([]);
  });

  it("should call toggleLike with the correct args", () => {
    const toggleLike = Resolver.Mutation.toggleLike;

    const res = toggleLike(null, { nodeId: "1234" }, {
      models: mockModels,
      user: mockUser,
    });
    expect(mockModels.Like.toggleLike).toHaveBeenCalledWith("1234", "12345", {
    });
  });
});

describe("getRecentLikes", () => {
  afterEach(() => {
    mockModels.Like.getRecentlyLiked.mockReset();
  });

  it("should pass falsy for user, cache, limit, skip when not defined", () => {
    const recentlyLiked = Resolver.Query.recentlyLiked;
    recentlyLiked(null, {}, { models: mockModels, user: null });
    expect(mockModels.Like.getRecentlyLiked).toBeCalledWith(
      { cache: undefined, limit: undefined, skip: undefined },
      null,
      {},
    );
  });

  it("should call getRecentlyLiked with proper args", () => {
    const recentlyLiked = Resolver.Query.recentlyLiked;
    recentlyLiked(null, { limit: 0, skip: 1, cache: false }, {
      models: mockModels,
      user: { _id: "harambe" },
    });
    expect(mockModels.Like.getRecentlyLiked).toBeCalledWith(
      { cache: false, limit: 0, skip: 1 },
      "harambe",
      {},
    );
  });
});
