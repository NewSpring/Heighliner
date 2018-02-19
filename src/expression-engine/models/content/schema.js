
export default [`
  type LiveFeed {
    live: Boolean!
    embedCode: String
    embedUrl: String
    videoUrl: String
  }

  # should this be a global type that implements Node?
  # XXX abstract from content if ^^
  type ContentColor {
    id: ID
    value: String!
    description: String
  }

  type ContentScripture {
    book: String
    passage: String
  }

  type ContentData {
    body: String
    description: String
    ooyalaId: String @deprecated(reason: "Use video instead")
    video: ContentVideo
    speaker: String
    isLight: Boolean
    hashtag: String

    tags: [String] # XXX create global tag type
    colors: [ContentColor]
    images(sizes: [String], ratios: [String]): [File]

    # deprecated (use audio field)
    tracks: [File]
    audio: [File]
    scripture: [ContentScripture]
    isLiked: Boolean
  }

  type ContentVideo {
    id: String
    embedUrl: String
    videoUrl: String
  }

  type ContentMeta {
    site: ID
    channel: ID
    series: ID
    urlTitle: String
    summary: String

    date: String
    entryDate: String
    startDate: String
    endDate: String

    # XXX should this be named better?
    actualDate: String

    # deprecated
    siteId: ID
    channelId: ID
  }

  type Content implements Node {
    id: ID!
    title: String!
    status: String!
    channel: ID!
    channelName: String
    campus: Campus
    meta: ContentMeta
    content: ContentData
    authors: [String]
    parent: Content # XXX determine if this can be multiple
    children(channels: [String], showFutureEntries: Boolean = false): [Content]
    related(
      includeChannels: [String],
      limit: Int = 20,
      skip: Int = 0,
      cache: Boolean = true
    ): [Content]

    # deprecated (moved to other types)
    tracks: [File]
    seriesId: ID
    category: String
  }
`];
