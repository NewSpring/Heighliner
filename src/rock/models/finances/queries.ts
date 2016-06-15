
export default [
  `savedPayments(limit: Int = 20, skip: Int = 0, cache: Boolean = true): [SavedPayment]`,
  `transactions(limit: Int = 20, skip: Int = 0, cache: Boolean = true): [Transaction]`,

  `scheduledTransactions(
    limit: Int = 20, skip: Int = 0, cache: Boolean = true, isActive: Boolean = true
  ): [ScheduledTransaction]`,

  `accounts(
    name: String, isActive: Boolean = true, isPublic: Boolean = true
  ): [FinancialAccount]`,
];
