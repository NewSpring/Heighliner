import Resolver from "../resolver";

const sampleData = {
  person: {
    Id: "12345-ABCDE",
    FirstName: "John",
    LastName: "Doe",
    NickName: "Johnny",
    PhotoId: "12345-ABCDE",
    BirthDate: "1970-1-1T00:00:00.000Z",
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

xit("Pullng phone numbers seems to be disabled at the moment.", () => { }); // tslint:disable-line

it("`Person` has a photo.", () => {
  const { Person } = Resolver;

  const placeHolderPhoto = "//dg0ddngxdz549.cloudfront.net/images/cached/images/remote/http_s3.amazonaws.com/ns.images/all/member_images/members.nophoto_1000_1000_90_c1.jpg"; // tslint:disable-line

  const samplePhotoId = 100;
  const models = {
    BinaryFile: {
      getFromId(id) {
        expect(id).toEqual(samplePhotoId);
        return Promise.resolve({ Path: placeHolderPhoto });
      },
    },
  };

  Person.photo({PhotoId: samplePhotoId}, null, { models });

  // If no photoId then return placeholder image.
  const noPhotoAvailable = Person.photo({ PhotoId: null }, null, { models });
  expect(placeHolderPhoto === noPhotoAvailable).toBeTruthy();
});

// it("`Person` has an approximate age.", () => {
//   const { Person } = Resolver;

//   const age = Person.age(sampleData.person);
//   t.deepEqual(age, `${Moment().diff(Moment(sampleData.person.BirthDate), "years")}`);
// });


// it("`PhoneNumber` returns details about a persons phone number", () => {
//   t.pass();
// });
