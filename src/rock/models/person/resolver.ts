
import { flatten } from "lodash";
import { createGlobalId } from "../../../util";

export default {

  Query: {
    people: (_, { email }, { models }) => models.People.findByEmail(email),
    currentPerson: (_: any, args: any, { person }: any): any => person,
  },

  Person: {
    id: ({ Id }: any, _, $, { parentType }) => createGlobalId(Id, parentType.name),
    firstName: ({ FirstName }) => FirstName,
    lastName: ({ LastName }) => LastName,
    nickName: ({ NickName }) => NickName,
    photo: ({ PhotoId }, _, { models }) => {
      console.log(PhotoId, models)
      return "XXX";
      // return models.BinaryFile.getUrlFromId(PhotoId)
    },
    age: ({ BirthDate }) => {
      return "XXX";
    },
    birthDate: ({ BirthDate }) => BirthDate,
    birthDay: ({ BirthDay }) => BirthDay,
    birthMonth: ({ BirthMonth }) => BirthMonth,
    birthYear: ({ BirthYear }) => BirthYear,
    email: ({ Email }) => Email,
  },

}

  // # campus: [Campus]
  // # home: [Location]
  // # likes: [Content] // XXX should this be on user?