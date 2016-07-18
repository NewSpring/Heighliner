
export default [
  `people(email: String): [Person]`,

  `person(guid: ID): Person`,

  `currentPerson: Person`,

  `currentFamily: [GroupMember]`,
];
