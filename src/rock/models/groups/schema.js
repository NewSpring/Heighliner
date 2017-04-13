export default [
  `
  type GroupMember implements Node {
    id: ID!
    role: String
    person: Person
  }

  type GroupLocation implements Node {
    id: ID!
    location: Location
  }

  # XXX abstract
  type GroupSchedule implements Node {
    id: ID!
    name: String
    description: String
    start: String
    end: String
    day: String
    time: String
    iCal: String
  }

  type Group implements Node {
    active: Boolean
    ageRange: [Int]
    campus: Campus
    demographic: String
    description: String
    distance: Float
    entityId: Int
    id: ID!
    kidFriendly: Boolean
    name: String
    photo: String
    tags: [DefinedValue]
    type: String
    schedule: GroupSchedule
    members: [GroupMember]
    locations: [GroupLocation]
  }

  type GroupSearch {
    count: Int
    results: [Group]
  }

  type GroupsMutationResponse implements MutationResponse {
    error: String
    success: Boolean!
    code: Int
  }

`,
];
