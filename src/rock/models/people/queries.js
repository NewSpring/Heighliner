
export default [
  "people(email: String): [Person]",

  "person(guid: ID): Person",

  "currentPerson(cache: Boolean = false): Person",

  "currentFamily: [GroupMember]",
];
