export default [`
  type Label {
    name: String,
    parent: String,
    fullName: String,
    id: String,
  }

  type Asset {
    name: String
    description: String
    source: String
    labels: [Label]
    status: String
    duration: Int
    createdAt: String
    previewImage: String,
    filename: String,
  }
`];
