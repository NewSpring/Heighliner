
it("allows a test to be passed", () => {
  expect(true).toBeTruthy();
});

it("allows for promises", () =>
   new Promise((r) => {
     setTimeout(r, 10);
   }).then(() => {
     expect(true).toBeTruthy();
   }),
);

it("allows for async", async () => {
  const foo = await new Promise((r) => { setTimeout(r, 10); }).then(() => true);
  expect(foo).toBeTruthy();
});
