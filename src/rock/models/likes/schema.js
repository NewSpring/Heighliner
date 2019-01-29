export default [
  `
  type LikesMutationResponse implements MutationResponse {
    error: String
    success: Boolean!
    code: Int
    like: Node
  }
`
];
