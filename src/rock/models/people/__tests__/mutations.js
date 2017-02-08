
import mutations from "../mutations";

it("should have all needed mutations", () => {
  expect(mutations).toMatchSnapshot();
});
