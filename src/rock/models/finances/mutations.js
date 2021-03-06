export default [
  `syncTransactions(
    condition: String,
    transaction_type: String,
    action_type: String,
    transaction_id: String,
    order_id: String,
    last_name: String,
    email: String,
    start_date: String,
    end_date: String,
    personId: Int,
    gateway: String = "${process.env.NMI_GATEWAY}",
  ): [Transaction]`,

  `createOrder(
    data: String!
    id: ID
    instant: Boolean = false,
    gateway: String = "${process.env.NMI_GATEWAY}",
    url: String
  ): OrderMutationResponse`,

  `completeOrder(
    token: ID!
    scheduleId: ID
    platform: String
    accountName: String
    gateway: String = "${process.env.NMI_GATEWAY}",
  ): CompleteOrderMutationResponse`,

  `validate(
    token: ID!
    gateway: String = "${process.env.NMI_GATEWAY}",
  ): ValidateMutationResponse`,

  `cancelSavedPayment(
    id: ID
    entityId: Int
    gateway: String = "${process.env.NMI_GATEWAY}",
  ): SavePaymentMutationResponse`,

  `savePayment(
    token: ID!
    accountName: String
    gateway: String = "${process.env.NMI_GATEWAY}",
  ): SavePaymentMutationResponse`,

  `updateSavedPayment(
    entityId: Int
    name: String!
  ): SavePaymentMutationResponse`,

  `cancelSchedule(
    id: ID
    entityId: Int
    gateway: String = "${process.env.NMI_GATEWAY}",
  ): ScheduledTransactionMutationResponse`,

  `transactionStatement(
    limit: Int
    skip: Int
    people: [Int]
    start: String
    end: String
  ): StatementMutationResponse`
];
