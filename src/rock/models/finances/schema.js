export default [
  `
  type TransactionDetail implements Node {
    id: ID!
    amount: Float!
    account: FinancialAccount
  }

  type ScheduledTransaction implements Node {
    id: ID!
    entityId: Int!
    reminderDate: String
    start: String
    next: String
    code: String
    gateway: Int # we use this on the client I think?
    end: String
    numberOfPayments: Int
    date: String
    details: [TransactionDetail]
    transactions: [Transaction]
    schedule: DefinedValue
    payment: PaymentDetail
  }

  type Transaction implements Node {
    id: ID!
    entityId: Int!
    summary: String
    status: String
    statusMessage: String
    date: String
    details: [TransactionDetail]
    payment: PaymentDetail
    person: Person
    schedule: ScheduledTransaction
  }

  type OrderMutationResponse implements MutationResponse {
    error: String
    success: Boolean!
    code: Int
    url: String
    transactionId: ID
  }

  type CompleteOrderMutationResponse implements MutationResponse {
    error: String
    success: Boolean!
    code: Int
    transaction: Transaction
    schedule: ScheduledTransaction
    person: Person
    savedPayment: SavedPayment
  }

  type ValidateMutationResponse implements MutationResponse {
    error: String
    success: Boolean!
    code: Int
  }

  type OrderMutationResponse implements MutationResponse {
    error: String
    success: Boolean!
    code: Int
    url: String
    transactionId: ID
  }

  type CompleteOrderMutationResponse implements MutationResponse {
    error: String
    success: Boolean!
    code: Int
    transaction: Transaction
    schedule: ScheduledTransaction
    person: Person
    savedPayment: SavedPayment
  }

  type ValidateMutationResponse implements MutationResponse {
    error: String
    success: Boolean!
    code: Int
  }

  type FinancialAccount implements Node {
    id: ID!
    entityId: Int!
    transactions(
      limit: Int = 20,
      skip: Int = 0,
      cache: Boolean = true,
      start: String,
      end: String,
      people: [Int],
    ): [Transaction]
    total(
      start: String,
      end: String,
      people: [Int],
    ): Int
    name: String
    order: Int
    description: String
    summary: String
    image: String
    end: String
    start: String
    images: [File]
  }

  type PaymentDetail implements Node {
    id: ID!
    accountNumber: String
    paymentType: String!
  }

  type SavedPayment implements Node {
    id: ID!
    entityId: Int!
    name: String
    guid: String
    code: String!
    date: String
    payment: PaymentDetail
    expirationMonth: String
    expirationYear: String
  }


  type SavePaymentMutationResponse implements MutationResponse {
    error: String
    success: Boolean!
    code: Int
    savedPayment: SavedPayment
  }

  type ScheduledTransactionMutationResponse implements MutationResponse {
    error: String
    success: Boolean!
    code: Int
    schedule: ScheduledTransaction
  }


  type SavePaymentMutationResponse implements MutationResponse {
    error: String
    success: Boolean!
    code: Int
    savedPayment: SavedPayment
  }

  type ScheduledTransactionMutationResponse implements MutationResponse {
    error: String
    success: Boolean!
    code: Int
    schedule: ScheduledTransaction
  }

  type StatementMutationResponse implements MutationResponse {
    error: String
    success: Boolean!
    code: Int
    file: String
  }
`,
];
