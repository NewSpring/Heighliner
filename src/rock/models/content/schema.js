export default [
  `
  type RockContentChannel {
    id: ID!
    name: String
    url: String
    typeId: Int
    description: String
  }

  type RockContent implements Node{
    id: ID!
    entityId: Int
    content: String
    title: String
    entrydate: String
    image: String
    summary: String
    ooyalaId: String
    audioUrl: String
    channel: RockContentChannel
  }
`,
];
