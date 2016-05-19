const Images = {
  position: String,
  fileName: String,
  fileType: String,
  fileLabel: String,
  s3: String,
  cloudfront: String
}

const Media = {
  fileName: String,
  fileType: String,
  s3: String,
  cloudfront: String
}

const Meta = {
  urlTitle: String,
  date: Date,
  entryDate: Date,
  startDate: Date,
  endDate: Date,
  actualDate: Date,
  channelId: String
}

export {
  Images,
  Media,
  Meta,
}
