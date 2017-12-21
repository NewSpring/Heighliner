
export default [`
  type Backlot {
    cursor: Int
    assets: [Ooyala]
  }

  type Ooyala {
    name: String
    description: String
    source: String
    embedCode: String
    tags: [String]
    status: String
    duration: Int
  }
`];
