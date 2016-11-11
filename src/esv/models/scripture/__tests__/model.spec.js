// { ESV } errors out for some reason
import ESV from "../model";

it("should expose the get method", () => {
  const esv = new ESV.ESV();
  expect(esv.get).toBeDefined();
});
