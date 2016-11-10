// { ESV } errors out for some reason
import ESV from "../model";

it("should expose the get method", () => {
  const esv = new ESV.ESV() as any;
  expect(esv.get).toBeDefined();
});
