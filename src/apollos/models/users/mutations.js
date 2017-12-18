export default [
  "loginUser(email: String!, password: String!): LoginMutationResponse",
  "registerUser(email: String!, password: String!, firstName: String!, lastName: String!): UserMutationResponse",
  "changeUserPassword(oldPassword: String!, newPassword: String!): UserMutationResponse",
  "forgotUserPassword(username: String!, sourceURL: String): UserMutationResponse",
  "resetUserPassword(token: String!, newPassword: String!): UserMutationResponse",
];
