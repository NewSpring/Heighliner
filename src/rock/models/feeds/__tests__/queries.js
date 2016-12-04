import Queries from "../queries";

describe("Feeds Queries", () => {
  it("has all needed queries", () => {
    expect(Queries).toMatchSnapshot();
  });
});
