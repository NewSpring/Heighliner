import Resolver from "../resolver";

describe("Attribute", () => {
  const { Attribute } = Resolver;

  it("has id", () => {
    expect(Attribute.id({ Id: 4 }, null, null, {parentType: {name: "boi"}})).toMatchSnapshot();
  });
  it("has key", () => {
    expect(Attribute.key({ Key: 2 })).toEqual(2);
  });
  it("has description", () => {
    expect(Attribute.description({ Description: "boi" })).toEqual("boi");
  });
  it("has order", () => {
    expect(Attribute.order({ Order: 2 })).toEqual(2);
  });
  it("has values", () => {
    const models = { Rock: { getAttributeValuesFromAttributeId: jest.fn() } };
    Attribute.values(
      { Id: 2, EntityId: 43 },
      null,
      { models }
    );
    expect(models.Rock.getAttributeValuesFromAttributeId).toBeCalledWith(
      2,
      { models },
      43
    );
  });
});

describe("AttributeValue", () => {
  const { AttributeValue } = Resolver;

  it("has attribute", () => {
    const models = { Rock: { getAttributeFromId: jest.fn() } };
    AttributeValue.attribute(
      { AttributeId: 5 },
      null,
      { models },
    );
    expect(models.Rock.getAttributeFromId).toBeCalledWith(5);
  });
  it("has id", () => {
    expect(AttributeValue.id({ Id: 4 }, null, null, { parentType: {name: "boi"} })).toMatchSnapshot();
  });
  it("has value", () => {
    expect(AttributeValue.value({ Value: "yo" })).toEqual("yo")
  });

});
