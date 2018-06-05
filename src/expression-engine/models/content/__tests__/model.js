import { Content } from "../model";
import { createGlobalId } from "../../../../util/node/model";
import { ChannelData } from "../tables";

const newSpringLive = [
  {
    isLive: 1,
    entry_id: "12345",
    status: "just newspring",
  },
];

jest.mock("../tables", () => ({
  ChannelData: {
    find: jest.fn(),
  },
  channelDataSchema: {},
  channelSchema: {},
  channelTitleSchema: {},
  Channels: { Model: "wow" },
  ChannelTitles: { Model: "lol" },
}));

jest.mock("../../../../util/node/model");

describe("getLiveStream", () => {
  let Model;
  beforeEach(() => {
    Model = new Content();
  });
  afterEach(() => {
    Model = null;
  });

  it("should exist", () => {
    expect(Model.getLiveStream).toBeTruthy();
  });

  it("should call getIsLive", async () => {
    Model.getIsLive = jest.fn(() => Promise.resolve({ isLive: true }));
    await Model.getLiveStream();
    expect(Model.getIsLive).toBeCalled();
  });
});

describe("getIsLive", () => {
  let Model;
  beforeEach(() => {
    Model = new Content();
  });
  afterEach(() => {
    Model = null;
  });

  it("should exist", () => {
    expect(Model.getIsLive).toBeTruthy();
  });

  it("should call cache get", async () => {
    Model.cache.get = jest.fn(() => Promise.resolve(newSpringLive));
    await Model.getIsLive();
    expect(Model.cache.get).toBeCalled();
  });

  it("should show NewSpring is live correctly", async () => {
    Model.cache.get = jest.fn(() => Promise.resolve(newSpringLive));
    const res = await Model.getIsLive();
    expect(res).toEqual({
      isLive: 1,
      entry_id: "12345",
      status: "just newspring",
    });
  });

  it("should show nothing is live correctly", async () => {
    Model.cache.get = jest.fn(() => Promise.resolve([]));
    const res = await Model.getIsLive();
    expect(res).toEqual(undefined);
  });
});

describe("findByUrlTitle", () => {
  let Model;
  beforeEach(() => {
    Model = new Content();
  });
  afterEach(() => {
    Model = null;
  });

  it("should exist", () => {
    expect(Model.findByUrlTitle).toBeTruthy();
  });

  it("should call cache lookup", async () => {
    createGlobalId.mockReturnValueOnce("1234567");
    Model.cache.get = jest.fn(() => ({ entry_id: "1123" }));
    const res = await Model.findByUrlTitle("articles", "harambe");
    expect(res).toBeTruthy();
  });

  it("should call cache encode", async () => {
    Model.cache.encode = jest.fn();
    Model.cache.encode.mockReset();
    await Model.findByUrlTitle("articles", "harambe");
    expect(Model.cache.encode).toBeCalledWith(
      { channel: "articles", urlTitle: "harambe" },
      "Content",
    );
  });

  it("calls createGlobalId properly", async () => {
    createGlobalId.mockReset();
    Model.cache.get = jest.fn(() => ({ entry_id: "1123" }));
    const res = await Model.findByUrlTitle("articles", "harambe");
    expect(createGlobalId).toBeCalledWith("1123", "Content");
  });

  it("should return null for invalid lookup", async () => {
    createGlobalId.mockReset();
    Model.cache.get = jest.fn(() => ({}));
    const res = await Model.findByUrlTitle("articles", "harambe");
    expect(res).toEqual(null);
  });
});

describe("findByCampusName", () => {
  let Model;
  beforeEach(() => {
    Model = new Content();
    Model.cache.encode = jest.fn(() => "12345");
    Model.cache.get = jest.fn();
  });
  afterEach(() => {
    Model = null;
    ChannelData.find.mockReset();
  });

  it("should exist", () => {
    expect(Model.findByCampusName).toBeTruthy();
  });

  it("should call cache lookup", async () => {
    Model.getFromPublishedIds = jest.fn(() => ["dat Haramboi"]);
    Model.cache.get = jest.fn(() => Promise.resolve({ entry_id: "1123" }));
    const res = await Model.findByCampusName({}, "Cincinnati Zoo", true, null);
    expect(Model.cache.get).toBeCalled();
    expect(Model.cache.get.mock.calls[0][0]).toEqual("12345");
    expect(typeof Model.cache.get.mock.calls[0][1]).toEqual("function");
    expect(Model.cache.get.mock.calls[0][2]).toEqual({ ttl: 3600, cache: false });
  });

  it("should call find with proper where value for logged out users", async () => {
    Model.getFromPublishedIds = jest.fn(() => ["dat Haramboi"]);
    ChannelData.find.mockReturnValueOnce(Promise.resolve([]));
    // force cache to call second param (find)
    Model.cache.get.mockImplementationOnce((a, b) => b());
    const res = await Model.findByCampusName({}, null, true, null);
    expect(ChannelData.find.mock.calls[0][0].where.field_id_651).toEqual({ $or: ["", null] });
  });

  it("should call find with proper where value for logged in users", async () => {
    Model.getFromPublishedIds = jest.fn(() => ["dat Haramboi"]);
    ChannelData.find.mockReturnValueOnce(Promise.resolve([]));
    // force cache to call second param (find)
    Model.cache.get.mockImplementationOnce((a, b) => b());
    const res = await Model.findByCampusName({}, "Palace de Harambe", true, null);
    expect(ChannelData.find.mock.calls[0][0].where.field_id_651).toEqual({
      $or: [{ $like: "%Palace de Harambe" }, "", null],
    });
  });

  it("should pass correct value for globals to find", async () => {
    Model.getFromPublishedIds = jest.fn(() => ["dat Haramboi"]);
    ChannelData.find.mockReturnValueOnce(Promise.resolve([]));
    // force cache to call second param (find)
    Model.cache.get.mockImplementationOnce((a, b) => b());
    const res = await Model.findByCampusName({}, "Palace de Harambe", false, null);
    expect(ChannelData.find.mock.calls[0][0].where.field_id_651).toEqual({
      $like: "%Palace de Harambe",
    });
  });

  it("should pass correct value for channel", async () => {
    Model.getFromPublishedIds = jest.fn(() => ["dat Haramboi"]);
    ChannelData.find.mockReturnValueOnce(Promise.resolve([]));
    // force cache to call second param (find)
    Model.cache.get.mockImplementationOnce((a, b) => b());
    const res = await Model.findByCampusName({}, "Palace de Harambe", false, null);
    expect(ChannelData.find.mock.calls[0][0].include[0].where).toEqual({});
  });

  it("should pass correct value for channelTitles", async () => {
    Model.getFromPublishedIds = jest.fn(() => ["dat Haramboi"]);
    ChannelData.find.mockReturnValueOnce(Promise.resolve([]));
    // force cache to call second param (find)
    Model.cache.get.mockImplementationOnce((a, b) => b());
    const res = await Model.findByCampusName({}, "Palace de Harambe", false, null);
    expect(ChannelData.find.mock.calls[0][0].include[1].where).toMatchSnapshot();
  });

  it("should pass limit", async () => {
    Model.getFromPublishedIds = jest.fn(() => ["dat Haramboi"]);
    ChannelData.find.mockReturnValueOnce(Promise.resolve([]));
    // force cache to call second param (find)
    Model.cache.get.mockImplementationOnce((a, b) => b());
    const res = await Model.findByCampusName(
      { limit: 5, offset: 10 },
      "Palace de Harambe",
      false,
      null,
    );
    expect(ChannelData.find.mock.calls[0][0].limit).toEqual(5);
  });

  it("should pass offset", async () => {
    Model.getFromPublishedIds = jest.fn(() => ["dat Haramboi"]);
    ChannelData.find.mockReturnValueOnce(Promise.resolve([]));
    // force cache to call second param (find)
    Model.cache.get.mockImplementationOnce((a, b) => b());
    const res = await Model.findByCampusName(
      { limit: 5, offset: 10 },
      "Palace de Harambe",
      false,
      null,
    );
    expect(ChannelData.find.mock.calls[0][0].offset).toEqual(10);
  });
});
