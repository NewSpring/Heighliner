
import Moment from "moment";
import { createGlobalId } from "../../../util";

export default {

  Query: {
    people: (_, { email }, { models }) => models.Person.findByEmail(email),
    person: (_, { guid }, { models }) => {
      if (!guid) return null;
      return models.Person.findOne({ guid });
    },
    currentPerson: (_: any, args: any, { person }: any): any => person,
  },

  Person: {
    id: ({ Id }: any, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    entityId: ({ Id }) => Id,
    firstName: ({ FirstName }) => FirstName,
    lastName: ({ LastName }) => LastName,
    nickName: ({ NickName }) => NickName,
    phoneNumbers: ({ Id }, _, { models }) => { // tslint:disable-line
      return [];
      // XXX
      // return models.Person.getPhoneNumbersFromId(Id);
    },
    photo: ({ PhotoId }, _, { models }) => {
      if (!PhotoId) return "//dg0ddngxdz549.cloudfront.net/images/cached/images/remote/http_s3.amazonaws.com/ns.images/all/member_images/members.nophoto_1000_1000_90_c1.jpg"; // tslint:disable-line

      return models.BinaryFile.getFromId(PhotoId)
        .then(x => x.Path);

    },
    age: ({ BirthDate }) => `${Moment().diff(Moment(BirthDate), "years")}`,
    birthDate: ({ BirthDate }) => BirthDate,
    birthDay: ({ BirthDay }) => BirthDay,
    birthMonth: ({ BirthMonth }) => BirthMonth,
    birthYear: ({ BirthYear }) => BirthYear,
    email: ({ Email }) => Email,
    campus: ({ Id }, _, { models }) => models.Person.getCampusFromId(Id),
    home: ({ Id }, _, { models }) => {
      return models.Person.getHomesFromId(Id).then(x => x[0]); // only return the first home for now
    },
  },

  PhoneNumber: {
    id: ({ Id }: any, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    countryCode: ({ CountryCode }) => CountryCode,
    description: ({ Description }) => Description,
    canText: ({ IsMessagingEnabled }) => IsMessagingEnabled,
    rawNumber: ({ Number }) => Number,
    number: ({ NumberFormatted, Number }) => NumberFormatted || Number,
    person: ({ PersonId }, _, { models }) => models.Person.getFromId(PersonId),
  },

};


  // # home: [Location]
  // # likes: [Content] // XXX should this be on user?
