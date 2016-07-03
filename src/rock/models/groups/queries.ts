
export default [
  `groups(
    attributes: [String],
    limit: Int = 20,
    offset: Int = 0,
    query: String
  ): GroupSearch`,

  // XXX should this take a group type id?
  `groupAttributes: [DefinedValue]`,
];
