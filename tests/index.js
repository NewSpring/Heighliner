
import { assert } from "chai";

describe("test infrastructure", () => {

  it("allows a test to be passed", () => {
    assert(true).to.be.true;
  });

  it("allows an async test to be passed", (done) => {
    setTimeout(() => {
      assert(true).to.be.true;
      done()
    }, 100)
  })

});
