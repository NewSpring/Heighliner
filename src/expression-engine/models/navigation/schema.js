
export default [`
  type Navigation implements Node {
    id: ID!
    text: String
    link: String
    absoluteLink: String
    sort: Int
    image: String
    children: [Navigation]
  }
`];
