
import { createGlobalId } from "../../../util";

export default {

  Query: {
    people: (_, { email }, { models }) => models.Person.findByEmail(email),
    currentPerson: (_: any, args: any, { person }: any): any => person,
  },

  Person: {
    id: ({ Id }: any, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    firstName: ({ FirstName }) => FirstName,
    lastName: ({ LastName }) => LastName,
    nickName: ({ NickName }) => NickName,
    // photo: ({ PhotoId }, _, { models }) => {
    //   return "XXX";
    //   // return models.BinaryFile.getUrlFromId(PhotoId)
    // },
    // age: ({ BirthDate }) => {
    //   return "XXX";
    // },
    birthDate: ({ BirthDate }) => BirthDate,
    birthDay: ({ BirthDay }) => BirthDay,
    birthMonth: ({ BirthMonth }) => BirthMonth,
    birthYear: ({ BirthYear }) => BirthYear,
    email: ({ Email }) => Email,
    // campus: ({ Id }, _, { models }) => {

    // },
  },

};


  // # campus: [Campus]
  // # home: [Location]
  // # likes: [Content] // XXX should this be on user?
