
import { Rock } from "../model";
import { Note as NoteTable } from "../tables";

// import { createGlobalId } from "../../../../util/node";

jest.mock("../tables", () => ({
  Note: {
    find: jest.fn(),
  },
}));


const mockedCache = {
  get: jest.fn((id, lookup) => Promise.resolve().then(lookup)),
  set: jest.fn(() => Promise.resolve().then(() => true)),
  del() {},
  encode: jest.fn((obj, prefix) => `${prefix}${JSON.stringify(obj)}`),
};

describe("finding a note", () => {
  it("tries to find notes created by the person", async () => {
    const Local = new Rock({ cache: mockedCache });
    const PrimaryAliasId = 10;
    NoteTable.find.mockReturnValueOnce([]);
    await Local.getNotesByTypes({}, { person: { PrimaryAliasId } });

    expect(NoteTable.find).toBeCalledWith({ where: { CreatedByPersonAliasId: PrimaryAliasId } });
  });
});
