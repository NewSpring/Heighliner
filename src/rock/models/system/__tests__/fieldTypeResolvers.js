import Resolver from "../fieldTypeResolvers";
import Moment from "moment";

jest.mock("moment", () => () => ({
  toString: () => "harambe"
}));

describe("Date", () => {
  const date = Resolver["Rock.Field.Types.DateFieldType"];

  it("uses default value if no value passed", () => {
    expect(date(null, "2016-05-28")).toEqual("2016-05-28");
  });

  // uses moment mock
  it("uses value if present", () => {
    expect(date("2016-05-28", "2099-01-01")).toEqual("harambe");
  });
});

describe("SelectSingle", () => {
  const singleSelect = Resolver["Rock.Field.Types.SelectSingleFieldType"];

  it("uses default if no value", () => {
    expect(singleSelect(null, "hai")).toEqual("hai");
  });

  it("uses value if present", () => {
    expect(singleSelect("baramhe", "hai")).toEqual("baramhe");
  });
});
