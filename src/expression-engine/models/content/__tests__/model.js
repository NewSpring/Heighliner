
import { Content } from "../model";
import { createGlobalId } from "../../../../util/node/model";

jest.mock("../../../../util/node/model");

/*
async findByUrlTitle(channel, urlTitle) {
  const results = await this.cache.get(
    this.cache.encode({ channel, urlTitle }, this.__type), () => ChannelTitles.findOne({
      where: { url_title: urlTitle },
      attributes: ["entry_id"],
      include: [
        { model: Channels.model, where: { channel_name: channel } },
      ]
    }, { ttl: 3600, cache: false })
  );

  return createGlobalId(results.entry_id, this.__type);
};
*/

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
    Model.cache.get = jest.fn(() => ({ entry_id: "1123"}));
    const res = await Model.findByUrlTitle("articles","harambe");
    expect(res).toBeTruthy();
  });

  it("should call cache encode", async () => {
    Model.cache.encode = jest.fn();
    await Model.findByUrlTitle("articles","harambe");
    expect(Model.cache.encode).toBeCalled();
  });

  // it("should call cache encode", async () => {
  //   Model.cache.encode = jest.fn();
  //   await Model.findByUrlTitle("articles","harambe");
  //   expect(Model.cache.encode).toBeCalled();
  // });

  it("calls createGlobalId properly", async () => {
    createGlobalId.mockReset();
    Model.cache.get = jest.fn(() => ({ entry_id: "1123"}));
    const res = await Model.findByUrlTitle("articles","harambe");
    expect(createGlobalId).toBeCalled();
  });

});
