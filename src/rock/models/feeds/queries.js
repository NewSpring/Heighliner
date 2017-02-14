export default [
  `userFeed(
    filters: [String]!
    options: String = "{}"
    limit: Int = 20,
    skip: Int = 0,
    status: String = "open",
    cache: Boolean = true
  ): [Node]`,
];
