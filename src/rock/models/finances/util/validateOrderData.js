
const validateNMIResponse(response){
  // the response is supposed to have all of these keys after processing
  const detailKeys = [
    "Campus",
    "FinancialPaymentDetail",
    "FinancialPersonSavedAccount",
    "Transaction",
    "Schedule",
    "Location",
    "Person",
    "TransactionDetails",
    "SourceTypeValue",
    "FinancialPaymentValue"
  ];

  let missing = [];

  detailKeys.map((key) => {
    if (!response[key]) missing.push(key);
  });

  if (missing.length > 0) {
    return new Error(`missing processed response keys: ${missing.toString()}`);
  }
}

export {
  validateNMIResponse,
};
