import { PhoneNumber, Person, PersonalDevice } from "../model";
import {
  PhoneNumber as PhoneNumberTable,
  Person as PersonTable,
  PersonalDevice as PersonalDeviceTable
} from "../tables";

jest.mock("../tables", () => ({
  PhoneNumber: {
    post: jest.fn(),
    findOne: jest.fn(),
    cache: {
      del: jest.fn(() => {})
    }
  },
  Person: {
    fetch: jest.fn()
  },
  PersonalDevice: {
    post: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    cache: {
      del: jest.fn(() => {})
    }
  }
}));

jest.mock("node-uuid", () => ({
  v4: () => "guid",
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
      where: { Number: "5555555555", PersonId: 9999999999 }
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
      statusText: "BAD BAD BAD"
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

describe("Person", () => {
  let personModel;
  let personalDeviceModel;

  beforeEach(() => {
    personModel = new Person();
    personalDeviceModel = new PersonalDevice();
    PersonalDeviceTable.find.mockReturnValue([]);
  });

  describe("getIP", () => {
    it("should lookup on getIP", async () => {
      await personModel.getIP(123);
      expect(PersonTable.fetch).toHaveBeenCalledWith(
        "GET",
        "GetSearchDetails/123"
      );
    });
  });

  describe("personalDevice", () => {
    it("saveId returns 400 with no registration Id", async () => {
      const { saveId } = personalDeviceModel;
      const res = await saveId(null, "harambe", {});
      expect(res).toEqual({
        code: 400,
        success: false,
        error: "Insufficient information"
      });
    });

    it("saveId returns 400 with no person", async () => {
      const { saveId } = personalDeviceModel;
      const res = await saveId("123456", "chrome");
      expect(res).toEqual({
        code: 400,
        success: false,
        error: "Insufficient information"
      });
    });

    it("saveId returns 400 with no uuid", async () => {
      const { saveId } = personalDeviceModel;
      const res = await saveId("123456", null, {});
      expect(res).toEqual({
        code: 400,
        success: false,
        error: "Insufficient information"
      });
    });

    it("posts with correct info", async () => {
      const { saveId } = personalDeviceModel;
      const res = await saveId("123456", "chrome", { PrimaryAliasId: "harambe" });
      expect(PersonalDeviceTable.post).toBeCalledWith({
        PersonAliasId: "harambe",
        DeviceRegistrationId: "123456",
        PersonalDeviceTypeId: 671, // `mobile` device type
        NotificationsEnabled: 1,
        ForeignKey: "chrome",
        Guid: "guid",
      });
      expect(res).toEqual({ code: 200, success: true });
    });

    it("returns with 200 if post doesn't fail", async () => {
      const { saveId } = personalDeviceModel;
      const res = await saveId("123456", "chrome", { PrimaryAliasId: "harambe" });
      expect(res).toEqual({ code: 200, success: true });
    });

    it("returns error if post fails", async () => {
      const { saveId } = personalDeviceModel;
      PersonalDeviceTable.post.mockReturnValueOnce({
        status: 9999,
        statusText: "bruh no"
      });
      const res = await saveId("123456", "chrome", { PrimaryAliasId: "harambe" });
      expect(res).toEqual({ code: 9999, success: false, error: "bruh no" });
    });
  });
});
