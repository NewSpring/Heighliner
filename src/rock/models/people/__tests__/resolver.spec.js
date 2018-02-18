import Resolver from "../resolver";

const sampleData = {
  person: {
    Id: "12345-ABCDE",
    FirstName: "John",
    LastName: "Doe",
    NickName: "Johnny",
    PhotoId: "12345-ABCDE",
    BirthDate: "1970-1-1T00:00:00.000Z",
    Guid: "ABSJFE-HARAMBE-235463-AFGF",
    BirthDay: "17",
    BirthYear: "1984",
    BirthMonth: "10",
    Email: "email@example.com",
  },
  phone: {
    CountryCode: "1",
    Description: "Home",
    IsMessagingEnabled: "true",
    Number: "8648675309",
    PersonId: "12345-ABCDE",
  },
};

describe("Person Tests", () => {
  it("`Person` record should have an id.", () => {
    const { Person } = Resolver;

    const entityId = Person.entityId(sampleData.person);
    expect(entityId).toEqual(sampleData.person.Id);
  });

  it("`Person` should have a first name.", () => {
    const { Person } = Resolver;

    const firstName = Person.firstName(sampleData.person);
    expect(firstName).toEqual(sampleData.person.FirstName);
  });
  it("`Person` should have a last name.", () => {
    const { Person } = Resolver;

    const lastName = Person.lastName(sampleData.person);
    expect(lastName).toEqual(sampleData.person.LastName);
  });
  it("`Person` should have a Guid", () => {
    const { Person } = Resolver;

    const guid = Person.guid(sampleData.person);
    expect(guid).toEqual(sampleData.person.Guid);
  });
  xit("Pullng phone numbers seems to be disabled at the moment.", () => {}); // tslint:disable-line

  it("`Person` has a photo.", () => {
    const { Person } = Resolver;

    const placeHolderPhoto =
      "//dg0ddngxdz549.cloudfront.net/images/cached/images/remote/http_s3.amazonaws.com/ns.images/all/member_images/members.nophoto_1000_1000_90_c1.jpg"; // tslint:disable-line

    const samplePhotoId = 100;
    const models = {
      BinaryFile: {
        getFromId(id) {
          expect(id).toEqual(samplePhotoId);
          return Promise.resolve({ Path: placeHolderPhoto });
        },
      },
    };

    Person.photo({ PhotoId: samplePhotoId }, null, { models });

    // If no photoId then return placeholder image.
    const noPhotoAvailable = Person.photo({ PhotoId: null }, null, { models });
    expect(placeHolderPhoto === noPhotoAvailable).toBeTruthy();
  });

  it("`Person` has attributes", async () => {
    const models = { Rock: { getAttributesFromEntity: jest.fn() } };
    const { Person } = Resolver;

    await Person.attributes({ Id: 123 }, { key: "ThugLyfe" }, { models });
    expect(models.Rock.getAttributesFromEntity).toHaveBeenCalledWith(
      123,
      "ThugLyfe",
      15
    );
  });

  // it("`Person` has an approximate age.", () => {
  //   const { Person } = Resolver;

  //   const age = Person.age(sampleData.person);
  //   t.deepEqual(age, `${Moment().diff(Moment(sampleData.person.BirthDate), "years")}`);
  // });

  // it("`PhoneNumber` returns details about a persons phone number", () => {
  //   t.pass();
  // });
});

describe("PhoneNumber Mutations", () => {
  it("should return 401 with no person", async () => {
    const { setPhoneNumber } = Resolver.Mutation;
    const result = await setPhoneNumber(null, "(555) 555-5555", {});
    expect(result).toEqual({
      code: 401,
      error: "Must be logged in to make this request",
      success: false,
    });
  });

  it("should call the setPhoneNumber function properly if there is a person", async () => {
    const models = { PhoneNumber: { setPhoneNumber: jest.fn() } };
    const { setPhoneNumber } = Resolver.Mutation;
    await setPhoneNumber(
      null,
      {
        phoneNumber: "(555) 555-5555",
      },
      { models, person: "person" }
    );
    expect(models.PhoneNumber.setPhoneNumber).toHaveBeenCalledWith(
      {
        phoneNumber: "(555) 555-5555",
      },
      "person"
    );
  });

  it("should have an impersonation parameter", async () => {
    const models = { Person: { getIP: jest.fn() } };
    const person = { Id: 1234 };
    const ipArgs = {
      expireDateTime: "2037-09-03T17:56:26-04:00",
      usageLimit: 1,
      pageId: 100,
    };

    const { impersonationParameter } = Resolver.Person;

    await impersonationParameter(person, ipArgs, { models, person });

    expect(models.Person.getIP).toHaveBeenCalledWith(1234, ipArgs);
  });

  it("should not return an ip if person not logged in", async () => {
    const models = { Person: { getIP: jest.fn() } };
    const { impersonationParameter } = Resolver.Person;

    const res = await impersonationParameter(1234, null, { models });

    expect(models.Person.getIP).not.toBeCalled();
    expect(res).toEqual(null);
  });
});

describe("DeviceRegistration Mutation", () => {
  it("should return 401 with no person", async () => {
    const { saveDeviceRegistrationId } = Resolver.Mutation;
    const result = await saveDeviceRegistrationId(null, "(555) 555-5555", {});
    expect(result).toEqual({
      code: 401,
      error: "Must be logged in to make this request",
      success: false,
    });
  });

  it("should call saveId properly if there is a person", async () => {
    const models = { PersonalDevice: { saveId: jest.fn() } };
    const { saveDeviceRegistrationId } = Resolver.Mutation;
    await saveDeviceRegistrationId(
      null,
      {
        registrationId: "harambe",
        uuid: "chrome",
      },
      { models, person: "person" }
    );
    expect(models.PersonalDevice.saveId).toHaveBeenCalledWith(
      "harambe",
      "chrome",
      "person"
    );
  });
});
