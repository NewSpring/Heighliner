
// import Resolver from "../resolver";
import Like from "../model";

jest.mock("node-uuid", () => ({
  uuid: {
    v4: () => "1234567"
  }
}));

jest.mock("../../../../apollos/mongo", () => ({
  MongoConnector: jest.fn(() => ({
    find: () => "123",
    remove: () => "123",
    create: () => "123",
  }))
}));

jest.mock("../../../../util/cache", () => ({
  defaultCache: {
    get: jest.fn(() => "123"),
    del: jest.fn(() => "123")
  }
}));

jest.mock("../../../../util/node/model", () => ({
  createGlobalId: jest.fn(() => "12341234")
}));

describe("Like", () => {
  let like;
  beforeEach(() => {
    //construct like
  });

  afterEach(() => {
    like = null;
  })

  it("", () => {

  });

});
