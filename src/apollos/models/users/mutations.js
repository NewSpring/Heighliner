export default [
  "loginUser(email: String!, password: String!): LoginUserMutationResponse",
  "registerUser(email: String!, password: String!, firstName: String!, lastName: String!): RegisterUserMutationResponse",
  "changeUserPassword(oldPassword: String!, newPassword: String!): ChangeUserPasswordMutationResponse",
  "forgotUserPassword(username: String!, sourceURL: String): ForgotUserMutationResponse",
  "resetUserPassword(token: String!, newPassword: String!): ResetUserMutationResponse",
];
