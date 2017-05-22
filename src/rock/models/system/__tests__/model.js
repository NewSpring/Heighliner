
import { Rock } from "../model";

import {
  SystemEmail as SystemEmailTable,
  Communication as CommunicationTable,
  CommunicationRecipient as CommunicationRecipientTable,
  Attribute as AttributeModel,
  AttributeValue as AttributeValueModel,
  FieldType as FieldTypeModel,
  AttributeQualifier as AttributeQualifierModel,
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
  Attribute: {
    findOne: jest.fn(),
    find: jest.fn(),
    model: "hey",
  },
  AttributeValue: {
    find: jest.fn(() => Promise.resolve([])),
  },
  FieldType: {
    model: "hey",
  },
  AttributeQualifier: {
    model: "boi",
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

describe("getAttributeFromId", () => {
  let Local;
  beforeEach(() => {
    Local = new Rock({ cache: mockedCache });
  });

  it("calls cache lookup", async () => {
    await Local.getAttributeFromId(10);
    expect(mockedCache.get.mock.calls[0][0]).toEqual("10:getAttributeFromId");
    expect(typeof mockedCache.get.mock.calls[0][1]).toEqual("function");
  });

  it("it calls findone with correct info", async () => {
    await Local.getAttributeFromId(10);
    expect(AttributeModel.findOne).toBeCalledWith({ where: {Id: 10}});
  });
});

describe("getAttributeValuesFromAttributeId", () => {
  let Local;
  beforeEach(() => {
    Local = new Rock({ cache: mockedCache });
    jest.resetAllMocks();
  });
  afterEach(() => {
    Local = undefined;
  });

  it("returns empty if nothing found", async () => {
    expect(await Local.getAttributeValuesFromAttributeId(10, null, 123)).toEqual();
  });

  it("calls cache lookup", async () => {
    await Local.getAttributeValuesFromAttributeId(10, null, 123);
    expect(mockedCache.get.mock.calls[0][0]).toEqual("10:123:getAttributeValuesFromAttributeId");
    expect(typeof mockedCache.get.mock.calls[0][1]).toEqual("function");
  });

  it("it calls find with correct info", async () => {
    AttributeValueModel.find.mockReturnValueOnce(Promise.resolve([]));
    await Local.getAttributeValuesFromAttributeId(10, null, 123);
    await mockedCache.get.mock.calls[0][1]();
    expect(AttributeValueModel.find).toBeCalledWith({
      where: {AttributeId: 10, EntityId: 123},
      include: [{include: [{model: "hey"}], model: "hey"}],
    });
  });

  it("maps over AttributeValueModel find results", async () => {
    Local.processAttributeValue = jest.fn();
    AttributeValueModel.find.mockReturnValueOnce(Promise.resolve(["bro"]));
    await Local.getAttributeValuesFromAttributeId(10, null, 123);
    const res = await mockedCache.get.mock.calls[0][1]();
    expect(Local.processAttributeValue).toBeCalledWith("bro");
  });

  it("returns properly formatted data", async () => {
    Local.processAttributeValue = jest.fn(() => "VALUE");
    AttributeValueModel.find.mockReturnValueOnce(Promise.resolve([{whatWasAnInsideJob: "harambe"}]));
    await Local.getAttributeValuesFromAttributeId(10, null, 123);
    const res = await mockedCache.get.mock.calls[0][1]();
    expect(res).toEqual([{
      Value: "VALUE",
      whatWasAnInsideJob: "harambe",
    }]);
  });
});

describe("getAttributesFromEntity", () => {
  let Local;
  beforeEach(() => {
    // mockedCache.get.mockReturnValueOnce([]);
    Local = new Rock({ cache: mockedCache });
    jest.resetAllMocks();
  });
  afterEach(() => {
    Local = undefined;
  });

  it("returns empty if nothing found", async () => {
    mockedCache.get.mockReturnValue(Promise.resolve([]));
    expect(await Local.getAttributesFromEntity(10, "Harambe", 123)).toEqual([]);
  });

  it("calls cache get properly", async () => {
    mockedCache.get.mockReturnValue(Promise.resolve([]));
    await Local.getAttributesFromEntity(10, "Harambe", 123);
    expect(mockedCache.get.mock.calls[0][0]).toEqual("10:Harambe:getAttributesFromEntity");
    expect(typeof mockedCache.get.mock.calls[0][1]).toEqual("function");
  });

  it("calls find properly", async () => {
    mockedCache.get.mockReturnValue(Promise.resolve([]));
    await Local.getAttributesFromEntity(10, "Harambe", 123);
    expect(mockedCache.get.mock.calls[0][0]).toEqual("10:Harambe:getAttributesFromEntity");
    await mockedCache.get.mock.calls[0][1]();
    expect(AttributeModel.find).toBeCalledWith({include: [{model: "hey"}, {model: "boi"}], where: {EntityTypeId: 123, Key: "Harambe"}});
  });

  it("handles results that aren't defined values", async () => {
    const stuff = {
      FieldType: {Class: "a"},
      Id: 1,
      Name: "banana",
      Description: "What he eats",
    };
    mockedCache.get.mockReturnValue(Promise.resolve([stuff]));
    const res = await Local.getAttributesFromEntity(10, "Harambe", 123);
    expect(res).toEqual([{
      Description: stuff.Description,
      EntityId: 10,
      Id: stuff.Id,
      Value: stuff.Name
    }]);
  });

  it("handles defined value results", async () => {
    const stuff = {
      FieldType: {Class: "Rock.Field.Types.DefinedValueFieldType"},
      AttributeQualifiers: [{Key: "definedtype", Value: "piggy"}],
    };
    //mock defined value lookup
    Local.getDefinedValuesByTypeId = jest.fn(() => Promise.resolve({wow: "boi"}));
    mockedCache.get.mockReturnValue(Promise.resolve([stuff]));
    const res = await Local.getAttributesFromEntity(10, "Harambe", 123);
    expect(Local.getDefinedValuesByTypeId).toBeCalledWith("piggy");
    expect(res).toEqual([{ EntityId: 10, wow: "boi" }]);
  });
});
