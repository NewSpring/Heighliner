
import { Rock } from "../model";

import {
  SystemEmail as SystemEmailTable,
  Communication as CommunicationTable,
  CommunicationRecipient as CommunicationRecipientTable,
} from "../tables";

jest.mock("../tables", () => ({
  SystemEmail: {
    findOne: jest.fn(),
  },
  Communication: {
    post: jest.fn(),
    patch: jest.fn(),
  },
  CommunicationRecipient: {
    post: jest.fn(),
  },
}));

jest.mock("node-uuid", () => ({
  v4: () => "guid",
}));

const mockedCache = {
  get: jest.fn((id, lookup) => Promise.resolve().then(lookup)),
  set: jest.fn(() => Promise.resolve().then(() => true)),
  del() {},
  encode: jest.fn((obj, prefix) => `${prefix}${JSON.stringify(obj)}`),
};

describe("sendEmail", () => {
  let Local;
  beforeEach(() => {
    Local = new Rock({ cache: mockedCache });
  });
  afterEach(() => {
    Local = undefined;
  });
  it("it error if no title is passed", async () => {
    try {
      await Local.sendEmail();
      throw new Error("Should have failed");
    } catch (e) {
      expect(e.message).toMatch("No email passed");
    }
  });
  it("it should lookup the email based on title", async () => {
    SystemEmailTable.findOne.mockReturnValueOnce(Promise.resolve());

    const result = await Local.sendEmail("test");

    expect(SystemEmailTable.findOne).toBeCalledWith({
      where: { Title: "test" },
    });
    expect(result).toBe(null);
  });
  it("it should return null if no Body", async () => {
    SystemEmailTable.findOne.mockReturnValueOnce(Promise.resolve({ Subject: "foo" }));

    const result = await Local.sendEmail("test");

    expect(SystemEmailTable.findOne).toBeCalledWith({
      where: { Title: "test" },
    });
    expect(result).toBe(null);
  });
  it("it should return null if no Subject", async () => {
    SystemEmailTable.findOne.mockReturnValueOnce(Promise.resolve({ Body: "foo" }));

    const result = await Local.sendEmail("test");

    expect(SystemEmailTable.findOne).toBeCalledWith({
      where: { Title: "test" },
    });
    expect(result).toBe(null);
  });
  it("it should create a Communication and patch it", async () => {
    SystemEmailTable.findOne.mockReturnValueOnce(Promise.resolve({
      Subject: "foo", Body: "bar",
    }));
    CommunicationTable.post.mockReturnValueOnce(Promise.resolve(10));
    CommunicationTable.patch.mockReturnValueOnce(Promise.resolve(true));

    const result = await Local.sendEmail("test");

    expect(CommunicationTable.post).toBeCalledWith({
      SenderPersonAliasId: null,
      Status: 3,
      IsBulkCommunication: false,
      Guid: "guid",
      Subject: "foo",
      MediumData: { HtmlMessage: "bar" },
      Id: 10, // XXX bug in Jest
    });
    expect(CommunicationTable.patch).toBeCalledWith(10, {
      MediumEntityTypeId: 37, // Mandrill
    });
    expect(result).toEqual([]);
  });
  it("it should create CommunicationRecipient for all people", async () => {
    SystemEmailTable.findOne.mockReturnValueOnce(Promise.resolve({
      Subject: "foo", Body: "bar",
    }));
    CommunicationTable.post.mockReturnValueOnce(Promise.resolve(10));
    CommunicationTable.patch.mockReturnValueOnce(Promise.resolve(true));
    CommunicationRecipientTable.post.mockReturnValueOnce(Promise.resolve(12));
    const result = await Local.sendEmail("test", [1], { foo: "bar" });

    expect(CommunicationRecipientTable.post).toBeCalledWith({
      PersonAliasId: 1,
      CommunicationId: 10,
      Status: 0, // Pending
      Guid: "guid",
      AdditionalMergeValuesJson: JSON.stringify({ foo: "bar" }),
    });
    expect(result).toEqual([12]);
  });
});
