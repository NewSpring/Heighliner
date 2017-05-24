import Moment from "moment";
import { createGlobalId } from "../../../util";

const MutationReponseResolver = {
  error: ({ error }) => error,
  success: ({ success, error }) => success || !error,
  code: ({ code }) => code
};
// models.Rock.getAttributeValueFromMatrix('SiteVersion', 'Sites', 10, 'Version')

export default {
  Query: {
    people: (_, { email }, { models }) => models.Person.findByEmail(email),
    person: (_, { guid }, { models }) => {
      if (!guid) return null;

      return models.Person.findOne({ guid });
    },
    currentPerson: (_, { cache }, { person, models, user }) => {
      if (cache && person) return person;
      if (user && user.services && user.services.rock) {
        return models.Person.getFromAliasId(user.services.rock.PrimaryAliasId, {
          cache
        });
      }
    },
    currentFamily: (_, args, { models, person }) => {
      if (!person) return null;
      return models.Person.getFamilyFromId(person.Id);
    }
  },

  Mutation: {
    setPhoneNumber: (_, { phoneNumber }, { models, person }) => {
      if (!person) {
        return {
          code: 401,
          success: false,
          error: "Must be logged in to make this request"
        };
      }
      return models.PhoneNumber.setPhoneNumber({ phoneNumber }, person);
    },
    saveDeviceRegistrationId: (
      _,
      { registrationId, uuid },
      { models, person }
    ) => {
      if (!person)
        return {
          code: 401,
          success: false,
          error: "Must be logged in to make this request"
        };
      return models.PersonalDevice.saveId(registrationId, uuid, person);
    },
    setPersonAttribute: (_, { value, key }, { models, person, ...rest }) => {
      if (!person) {
        return {
          code: 401,
          success: false,
          error: "Must be logged in to make this request"
        };
      }
      return models.Person.setPersonAttribute({ key, value }, person, {
        models,
        person,
        ...rest
      });
    }
  },

  Person: {
    id: ({ Id }, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    entityId: ({ Id }) => Id,
    guid: ({ Guid }) => Guid,
    firstName: ({ FirstName }) => FirstName,
    lastName: ({ LastName }) => LastName,
    nickName: ({ NickName }) => NickName,
    impersonationParameter: ({ Id }, _, { models, person }) => {
      if (!person || !person.Id) return null;
      return models.Person.getIP(Id);
    },
    phoneNumbers: (
      { Id },
      _,
      { models } // tslint:disable-line
    ) => models.Person.getPhoneNumbersFromId(Id),
    photo: ({ PhotoId }, _, { models }) => {
      if (!PhotoId) {
        return "//dg0ddngxdz549.cloudfront.net/images/cached/images/remote/http_s3.amazonaws.com/ns.images/all/member_images/members.nophoto_1000_1000_90_c1.jpg";
      } // tslint:disable-line

      return models.BinaryFile.getFromId(PhotoId).then(x => x.Path);
    },
    age: ({ BirthDate }) => `${Moment().diff(Moment(BirthDate), "years")}`,
    birthDate: ({ BirthDate }) => BirthDate,
    birthDay: ({ BirthDay }) => BirthDay,
    birthMonth: ({ BirthMonth }) => BirthMonth,
    birthYear: ({ BirthYear }) => BirthYear,
    email: ({ Email }) => Email,
    campus: ({ Id }, { cache = true }, { models }) =>
      models.Person.getCampusFromId(Id, { cache }),
    home: ({ Id }, { cache = true }, { models }) =>
      models.Person.getHomesFromId(Id, { cache }).then(x => x[0]), // only return the first home for now,
    attributes: ({ Id }, { key }, { models }) =>
      models.Rock.getAttributesFromEntity(Id, key, 15 /* Person Entity Type */),
    roles: ({ Id }, { cache = true }, { models }) =>
      models.Person.getGroups(Id, 1), // 1: security groups
    groups: ({ Id }, { cache = true, groupTypeIds = [] }, { models }) =>
      models.Person.getGroups(Id, groupTypeIds)
  },

  PhoneNumber: {
    id: ({ Id }, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    countryCode: ({ CountryCode }) => CountryCode,
    description: ({ Description }) => Description,
    canText: ({ IsMessagingEnabled }) => IsMessagingEnabled,
    rawNumber: ({ Number }) => Number,
    number: ({ NumberFormatted, Number }) => NumberFormatted || Number,
    person: ({ PersonId }, _, { models }) => models.Person.getFromId(PersonId)
  },

  PhoneNumberMutationResponse: {
    ...MutationReponseResolver
  },

  DeviceRegistrationMutationResponse: {
    ...MutationReponseResolver
  },

  AttributeValueMutationResponse: {
    ...MutationReponseResolver
  }
};

// # home: [Location]
// # likes: [Content] // XXX should this be on user?
