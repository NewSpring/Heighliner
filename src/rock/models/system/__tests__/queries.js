import queries from "../queries";
import schema from "../schema";

it("matches snapshot", () => {
  expect(queries).toMatchSnapshot();
});

it("matches schema snapshot", () => {
  expect(schema).toMatchSnapshot();
});
