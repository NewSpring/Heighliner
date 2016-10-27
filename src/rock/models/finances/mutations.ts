
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
    gateway: String = "NMI Gateway",
  ): [Transaction]`,

  // used to cancel a saved payment
  // id is the node id which will be parsed into the entity id
  `cancelSavedPayment(
    id: ID!
  ): [MutationStatus]`,

];
