
import resolver from "../resolver";

describe("Notes", () => {
  xit("maps the id", () => {
    expect(resolver.Note.id({ Id: 1 })).toEqual(1);
  });
  it("maps the entityId", () => {
    expect(resolver.Note.entityId({ EntityId: 1 })).toEqual(1);
  });
  it("maps the text", () => {
    expect(resolver.Note.text({ Text: "100" })).toEqual("100");
  });
});
