import mutations from "../mutations";

it("should contain mutations", () => {
  expect(mutations).toMatchSnapshot();
});
