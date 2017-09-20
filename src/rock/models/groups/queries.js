export default [
  `groups(
    attributes: [String],
    limit: Int = 20,
    offset: Int = 0,
    query: String,
    clientIp: String,
    campuses: [String],
    campus: String,
    latitude: Float,
    longitude: Float,
    zip: String,
    schedules: [Int],
  ): GroupSearch`,

  // XXX clientIp and campuses are depracated
  //
  // XXX should this take a group type id?
  "groupAttributes: [DefinedValue]",
];
