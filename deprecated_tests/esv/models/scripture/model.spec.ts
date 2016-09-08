import test from "ava";
// { ESV } errors out for some reason
import ESV from "../../../../src/esv/models/scripture/model";

test("`ESV` should expose the get method", t => {
  const esv = new ESV.ESV() as any;
  t.truthy(esv.get);
});
