export default [
  "loginUser(email: String!, password: String!): LoginMutationResponse",
  "registerUser(email: String!, password: String!, firstName: String!, lastName: String!): LoginMutationResponse",
  "logoutUser: Boolean",
  "changeUserPassword(oldPassword: String!, newPassword: String!): Boolean",
  "forgotUserPassword(email: String!, sourceURL: String): Boolean",
  "resetUserPassword(token: String!, newPassword: String!): LoginMutationResponse",
  "toggleTopic(topic: String!): Boolean",
];
