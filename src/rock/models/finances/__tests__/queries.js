import queries from "../queries";

it("has all needed queries", () => {
  expect(queries).toMatchSnapshot();
});
