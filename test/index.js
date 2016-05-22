
import { expect } from "chai";

describe("test infrastructure", () => {

  it("allows a test to be passed", () => {
    expect(true).be.true;
  });

  it("allows an async test to be passed", (done) => {
    setTimeout(() => {
      expect(true).to.be.true;
      done()
    }, 100)
  })

});
