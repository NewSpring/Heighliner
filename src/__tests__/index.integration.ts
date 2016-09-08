
it("allows a test to be passed", () => {
  expect(true).toBeTruthy;
});

it("allows for promises", () => {
  return new Promise((r) => {
    setTimeout(r, 10);
  }).then(() => {
    expect(true).toBeTruthy;
  });
});
