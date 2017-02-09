import { PhoneNumber } from "../model";
import {
  PhoneNumber as PhoneNumberTable,
} from "../tables";

jest.mock("../tables", () => ({
  PhoneNumber: {
    post: jest.fn(),
    findOne: jest.fn(),
  },
}));

const mockArgs = { phoneNumber: "(555) 555-5555" };

describe("setPhoneNumber", () => {
  let phoneNumberModel;

  beforeEach(() => {
    phoneNumberModel = new PhoneNumber();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should return 400 if missing info", async () => {
    const { setPhoneNumber } = phoneNumberModel;
    const result = await setPhoneNumber({});
    expect(result.code).toEqual(400);
  });

  it("should return 200 if data is there", async () => {
    const { setPhoneNumber } = phoneNumberModel;
    const result = await setPhoneNumber(mockArgs, { Id: 999999999 });
    expect(result.code).toEqual(200);
  });

  it("should lookup phone number with proper query and fail if found", async () => {
    const { setPhoneNumber } = phoneNumberModel;
    PhoneNumberTable.findOne.mockReturnValueOnce("hello");

    await setPhoneNumber(mockArgs, { Id: 9999999999 });
    expect(PhoneNumberTable.findOne).toHaveBeenCalledWith({
      where: { Number: "5555555555", PersonId: 9999999999 },
    });
  });

  it("should return 204 if user already has a mobile phone on file", async () => {
    const { setPhoneNumber } = phoneNumberModel;
    PhoneNumberTable.findOne.mockReturnValueOnce("hello");

    const result = await setPhoneNumber(mockArgs, { Id: 9999999999 });
    expect(result.code).toEqual(204);
  });

  it("should fail if adding the phone number fails", async () => {
    const { setPhoneNumber } = phoneNumberModel;
    PhoneNumberTable.post.mockReturnValueOnce({
      status: 404,
      statusText: "BAD BAD BAD",
    });

    const result = await setPhoneNumber(mockArgs, { Id: 9999999999 });
    expect(result).toEqual({ code: 404, success: false, error: "BAD BAD BAD" });
  });

  it("should return MutationResponse", async () => {
    const { setPhoneNumber } = phoneNumberModel;

    const result = await setPhoneNumber(mockArgs, { Id: 9999999999 });
    // the bare minimum for mutation responses
    expect(Object.keys(result)).toEqual(["code", "success"]);
  });
});
