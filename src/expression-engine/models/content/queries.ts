// XXX implement pagination instead of skip
// use `after` for ^^
export default [

  `content(
    channel: String!,
    collection: ID,
    limit: Int = 20,
    skip: Int = 0,
    status: String = "open",
    cache: Boolean = true
  ): [Content]`,

  `feed(
    excludeChannels: [String],
    limit: Int = 20,
    skip: Int = 0,
    status: String = "open",
    cache: Boolean = true
  ): [Content]`,

];
