import test from "ava";

test("allows a test to be passed", t => {
  t.pass();
});

test("allows for promises", t => {
  return new Promise((r) => {
    setTimeout(r, 10);
  }).then(() => {
    t.pass();
  });
});

test("allows for generators", function* (t) {

  const value = yield new Promise((r) => {
    setTimeout(r, 10);
  }).then(() => {
    return true;
  });

  t.true(value);

});

test("allows for async functions", async t => {

  const value = await new Promise((r) => {
    setTimeout(r, 10);
  }).then(() => {
    return true;
  });

  t.true(value);

});
