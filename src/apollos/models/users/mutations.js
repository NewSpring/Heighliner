export default [
  "loginUser(email: String!, password: String!): LoginMutationResponse",
  "registerUser(email: String!, password: String!, firstName: String!, lastName: String!): LoginMutationResponse",
  "changeUserPassword(oldPassword: String!, newPassword: String!): UserMutationResponse",
  "forgotUserPassword(email: String!, sourceURL: String): UserMutationResponse",
  "resetUserPassword(token: String!, newPassword: String!): LoginMutationResponse",
];
