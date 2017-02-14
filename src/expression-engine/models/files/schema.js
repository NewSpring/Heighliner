export default [
  `
  # interface File {
  #   id: ID!
  #   file: String!
  #   type: String
  #   label: String

  #   s3: String
  #   cloudfront: String

  #   # deprecated
  #   fileName: String!
  #   fileType: String
  #   fileLabel: String
  # }

  type File implements Node {
    id: ID!
    file: String!
    label: String
    size: String

    url: String

    # deprecated
    s3: String
    cloudfront: String

    duration: String
    title: String

    # deprecated
    fileName: String!
    fileType: String
    fileLabel: String
  }
`,
];
