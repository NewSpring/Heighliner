
import { Content } from "../model";
import { createGlobalId } from "../../../../util/node/model";

jest.mock("../../../../util/node/model");

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
    Model.cache.encode.mockReset();
    await Model.findByUrlTitle("articles","harambe");
    expect(Model.cache.encode).toBeCalledWith({"channel": "articles", "urlTitle": "harambe"}, "Content");
  });

  it("calls createGlobalId properly", async () => {
    createGlobalId.mockReset();
    Model.cache.get = jest.fn(() => ({ entry_id: "1123"}));
    const res = await Model.findByUrlTitle("articles","harambe");
    expect(createGlobalId).toBeCalledWith("1123", "Content");
  });

  it("should return null for invalid lookup", async () => {
    createGlobalId.mockReset();
    Model.cache.get = jest.fn(() => ({}));
    const res = await Model.findByUrlTitle("articles","harambe");
    expect(res).toEqual(null);
  });

});
