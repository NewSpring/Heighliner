
export default [`
    type WistiaProject{
      id: ID!
      name: String!
      description: String
      mediaCount: Int
      medias: [WistiaMedia]
      created: String
      updated: String
      hashed_id: String
      canUpload: Boolean
      canDownload: Boolean
      publicId: String
    }
    type WistiaMedia {
      id: ID!
      name: String
      project: WistiaProject
      type: String
      status: String
      progress: Float
      section: String
      thumbnail: String
      duration: Int
      created: String
      updated: String
      assets: [WistiaMediaAsset]
      description: String
      hashed_id: String
    }

    type WistiaMediaAsset {
      url: String
      width: String
      height: String
      fileSize: Int
      contentType: String
      type: String
    }
`];
