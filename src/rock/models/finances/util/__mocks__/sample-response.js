export const standard = {
  transaction_id: "1",
  transaction_type: "cc",
  condition: "complete",
  order_id: "apollos_1",
  authorization_code: "111111",
  order_description: "Online contribution",
  first_name: "First",
  last_name: "Last",
  address_1: "Address",
  city: "City",
  state: "SC",
  postal_code: "29621",
  email: "test@email.com",
  customerid: "1",
  shipping: "0.00",
  cc_number: "4xxxxxxxxxxx1111",
  cc_hash: "111111111111111111111111111111",
  cc_exp: "0109",
  avs_response: "Z",
  processor_id: "newspringchurch",
  tax: "0.00",
  currency: "USD",
  entry_mode: "Keyed",
  merchant_defined_field: [{ id: "2", _: "16" }],
  cc_bin: "111111",
  product: {
    sku: "125",
    quantity: "1.0000",
    description: "General Fund",
  },
  action: {
    amount: "1.00",
    action_type: "sale",
    date: "20161102090845",
    success: "1",
    ip_address: "75.139.120.52",
    source: "api",
    username: "ahaskett1",
    response_text: "AP",
    batch_id: "0",
    response_code: "100",
    processor_response_text: "AP",
    processor_response_code: "000",
    requested_amount: "1",
  },
};

export const check = {
  transaction_id: "1",
  transaction_type: "ck",
  condition: "complete",
  order_id: "apollos_1",
  authorization_code: "111111",
  order_description: "Online contribution",
  first_name: "First",
  last_name: "Last",
  address_1: "Address",
  city: "City",
  state: "SC",
  postal_code: "29621",
  email: "test@email.com",
  customerid: "1",
  shipping: "0.00",
  check_account: "1xxxx1111",
  check_hash: "10",
  check_aba: "111111111",
  check_name: "My Check",
  account_holder_type: "personal",
  account_type: "checking",
  sec_code: "WEB",
  avs_response: "Z",
  processor_id: "newspringchurch",
  tax: "0.00",
  currency: "USD",
  entry_mode: "Keyed",
  merchant_defined_field: [{ id: "2", _: "16" }],
  cc_bin: "111111",
  product: {
    sku: "125",
    quantity: "1.0000",
    description: "General Fund",
  },
  action: {
    amount: "1.00",
    action_type: "sale",
    date: "20161102090845",
    success: "1",
    ip_address: "75.139.120.52",
    source: "api",
    username: "ahaskett1",
    response_text: "AP",
    batch_id: "0",
    response_code: "100",
    processor_response_text: "AP",
    processor_response_code: "000",
    requested_amount: "1",
  },
};

export const recurring = {
  transaction_id: "1",
  original_transaction_id: "10",
  transaction_type: "cc",
  condition: "complete",
  order_id: "apollos_1",
  authorization_code: "111111",
  order_description: "Online contribution",
  first_name: "First",
  last_name: "Last",
  address_1: "Address",
  city: "City",
  state: "SC",
  postal_code: "29621",
  email: "test@email.com",
  customerid: "1",
  shipping: "0.00",
  cc_number: "4xxxxxxxxxxx1111",
  cc_hash: "111111111111111111111111111111",
  cc_exp: "0109",
  avs_response: "Z",
  processor_id: "newspringchurch",
  tax: "0.00",
  currency: "USD",
  entry_mode: "Keyed",
  merchant_defined_field: [{ id: "2", _: "16" }, { id: "1", _: "128" }],
  cc_bin: "111111",
  product: {
    sku: "125",
    quantity: "1.0000",
    description: "General Fund",
  },
  action: {
    amount: "1.00",
    action_type: "sale",
    date: "20161102090845",
    success: "1",
    ip_address: "75.139.120.52",
    source: "recurring",
    username: "ahaskett1",
    response_text: "AP",
    batch_id: "0",
    response_code: "100",
    processor_response_text: "AP",
    processor_response_code: "000",
    requested_amount: "1",
  },
};

export const NMIExample = {
  transaction_id: "2612675976",
  transaction_type: "cc",
  condition: "complete",
  order_id: "1234567890",
  authorization_code: "123456",
  first_name: "John",
  last_name: "Smith",
  address_1: "123 Main St",
  address_2: "Apt B",
  city: "New York City",
  state: "NY",
  postal_code: "10001",
  country: "US",
  email: "johnsmith@example.com",
  phone: "1234567890",
  shipping: "1.00",
  cc_number: "4xxxxxxxxxxx1111",
  cc_hash: "f6c609e195d9d4c185dcc8ca662f0180",
  cc_exp: "1215",
  avs_response: "N",
  csc_response: "M",
  processor_id: "processora",
  tax: "1.00",
  currency: "USD",
  entry_mode: "Keyed",
  cc_bin: "411111",
  product: {
    sku: "RS-100",
    quantity: "1.0000",
    description: "Red Shirt",
    amount: "10.0000",
  },
  action: [
    {
      amount: "11.00",
      action_type: "sale",
      date: "20150312215205",
      success: "1",
      ip_address: "1.1.1.1",
      source: "virtual_terminal",
      username: "demo",
      response_text: "SUCCESS",
      batch_id: "0",
      response_code: "100",
      processor_response_text: "NO MATCH",
      processor_response_code: "00",
      requested_amount: "11.00",
    },
    {
      amount: "11.00",
      action_type: "level3",
      date: "20150312215205",
      success: "1",
      ip_address: "1.1.1.1",
      source: "virtual_terminal",
      username: "demo",
      batch_id: "0",
      response_code: "100",
    },
    {
      amount: "11.00",
      action_type: "settle",
      date: "20150313171503",
      success: "1",
      source: "internal",
      response_text: "ACCEPTED",
      batch_id: "76158269",
      processor_batch_id: "782",
      response_code: "100",
      processor_response_code: "0000000000021980",
    },
  ],
};

export const singleTransaction = {
  result: "1",
  "result-text": "SUCCESS",
  "transaction-id": "3388531907",
  "result-code": "100",
  "authorization-code": "123456",
  "avs-result": "N",
  "action-type": "sale",
  amount: "1.00",
  "amount-authorized": "1.00",
  "tip-amount": "0.00",
  "surcharge-amount": "0.00",
  "ip-address": "2602:306:b81a:c420:ed84:6327:b58e:6a2d",
  industry: "ecommerce",
  "processor-id": "ccprocessora",
  currency: "USD",
  "order-description": "Online contribution from Apollos",
  "customer-id": "1573550949",
  "customer-vault-id": "1573550949",
  "merchant-defined-field-2": "3",
  "order-id": "apollos_1480730692765_63167",
  "tax-amount": "0.00",
  "shipping-amount": "0.00",
  billing: {
    "billing-id": "1479728788",
    "first-name": "James",
    "last-name": "Baxley",
    address1: "808 Pebble Ln",
    city: "Anderson",
    state: "SC",
    postal: "29621-3452",
    email: "james.baxley@newspring.cc",
    "cc-number": "601160******6611",
    "cc-exp": "1025",
    priority: "1",
  },
  shipping: {
    "shipping-id": "1620191627",
    priority: "1",
  },
  product: {
    "product-code": "125",
    description: "General Fund",
    "commodity-code": "",
    "unit-of-measure": "1",
    "unit-cost": "",
    quantity: "1.0000",
    "total-amount": "1.00",
    "tax-amount": "",
    "tax-rate": "",
    "discount-amount": "",
    "discount-rate": "",
    "tax-type": "",
    "alternate-tax-id": "",
  },
};

export const multipleTransactions = {
  result: "1",
  "result-text": "SUCCESS",
  "transaction-id": "3388531907",
  "result-code": "100",
  "authorization-code": "123456",
  "avs-result": "N",
  "action-type": "sale",
  amount: "1.00",
  "amount-authorized": "1.00",
  "tip-amount": "0.00",
  "surcharge-amount": "0.00",
  "ip-address": "2602:306:b81a:c420:ed84:6327:b58e:6a2d",
  industry: "ecommerce",
  "processor-id": "ccprocessora",
  currency: "USD",
  "order-description": "Online contribution from Apollos",
  "customer-id": "1573550949",
  "customer-vault-id": "1573550949",
  "merchant-defined-field-2": "3",
  "order-id": "apollos_1480730692765_63167",
  "tax-amount": "0.00",
  "shipping-amount": "0.00",
  billing: {
    "billing-id": "1479728788",
    "first-name": "James",
    "last-name": "Baxley",
    address1: "808 Pebble Ln",
    city: "Anderson",
    state: "SC",
    postal: "29621-3452",
    email: "james.baxley@newspring.cc",
    "cc-number": "601160******6611",
    "cc-exp": "1025",
    priority: "1",
  },
  shipping: {
    "shipping-id": "1620191627",
    priority: "1",
  },
  product: [
    {
      "product-code": "125",
      description: "General Fund",
      "commodity-code": "",
      "unit-of-measure": "1",
      "unit-cost": "",
      quantity: "1.0000",
      "total-amount": "1.00",
      "tax-amount": "",
      "tax-rate": "",
      "discount-amount": "",
      "discount-rate": "",
      "tax-type": "",
      "alternate-tax-id": "",
    },
    {
      "product-code": "128",
      description: "Step Up Fund",
      "commodity-code": "",
      "unit-of-measure": "1",
      "unit-cost": "",
      quantity: "1.0000",
      "total-amount": "3.00",
      "tax-amount": "",
      "tax-rate": "",
      "discount-amount": "",
      "discount-rate": "",
      "tax-type": "",
      "alternate-tax-id": "",
    },
  ],
};

export const singleACHTransaction = {
  result: "1",
  "result-text": "SUCCESS",
  "transaction-id": "3388531907",
  "result-code": "100",
  "authorization-code": "123456",
  "avs-result": "N",
  "action-type": "sale",
  amount: "1.00",
  "amount-authorized": "1.00",
  "tip-amount": "0.00",
  "surcharge-amount": "0.00",
  "ip-address": "2602:306:b81a:c420:ed84:6327:b58e:6a2d",
  industry: "ecommerce",
  "processor-id": "ccprocessora",
  currency: "USD",
  "order-description": "Online contribution from Apollos",
  "customer-id": "1573550949",
  "customer-vault-id": "1573550949",
  "merchant-defined-field-2": "3",
  "order-id": "apollos_1480730692765_63167",
  "tax-amount": "0.00",
  "shipping-amount": "0.00",
  billing: {
    "billing-id": "1479728788",
    "first-name": "James",
    "last-name": "Baxley",
    address1: "808 Pebble Ln",
    city: "Anderson",
    state: "SC",
    postal: "29621-3452",
    email: "james.baxley@newspring.cc",
    "account-number": 1111111111,
    "routing-number": 111111111,
    "account-type": "checking",
    priority: "1",
  },
  shipping: {
    "shipping-id": "1620191627",
    priority: "1",
  },
  product: {
    "product-code": "125",
    description: "General Fund",
    "commodity-code": "",
    "unit-of-measure": "1",
    "unit-cost": "",
    quantity: "1.0000",
    "total-amount": "1.00",
    "tax-amount": "",
    "tax-rate": "",
    "discount-amount": "",
    "discount-rate": "",
    "tax-type": "",
    "alternate-tax-id": "",
  },
};

export const scheduleTransaction = {
  result: "1",
  "result-text": "SUCCESS",
  "transaction-id": "3388531907",
  "result-code": "100",
  "authorization-code": "123456",
  "avs-result": "N",
  "action-type": "sale",
  amount: "1.00",
  "amount-authorized": "1.00",
  "tip-amount": "0.00",
  "surcharge-amount": "0.00",
  "ip-address": "2602:306:b81a:c420:ed84:6327:b58e:6a2d",
  industry: "ecommerce",
  "processor-id": "ccprocessora",
  currency: "USD",
  "order-description": "Online contribution from Apollos",
  "customer-id": "1573550949",
  "customer-vault-id": "1573550949",
  "merchant-defined-field-1": "128",
  "merchant-defined-field-2": "3",
  "merchant-defined-field-3": "20150101",
  "order-id": "apollos_1480730692765_63167",
  "tax-amount": "0.00",
  "shipping-amount": "0.00",
  billing: {
    "billing-id": "1479728788",
    "first-name": "James",
    "last-name": "Baxley",
    address1: "808 Pebble Ln",
    city: "Anderson",
    state: "SC",
    postal: "29621-3452",
    email: "james.baxley@newspring.cc",
    "account-number": 1111111111,
    "routing-number": 111111111,
    "account-type": "checking",
    priority: "1",
  },
  shipping: {
    "shipping-id": "1620191627",
    priority: "1",
  },
  plan: {
    payments: 0,
    amount: 1.02,
    "plan-id": ";aljdflakf",
    "day-frequency": 1,
    "month-frequency": 2,
    "day-of-month": 1,
  },
};

export const multiFundScheduleTransaction = {
  result: "1",
  "result-text": "SUCCESS",
  "transaction-id": "3388531907",
  "result-code": "100",
  "authorization-code": "123456",
  "avs-result": "N",
  "action-type": "sale",
  amount: "1.00",
  "amount-authorized": "1.00",
  "tip-amount": "0.00",
  "surcharge-amount": "0.00",
  "ip-address": "2602:306:b81a:c420:ed84:6327:b58e:6a2d",
  industry: "ecommerce",
  "processor-id": "ccprocessora",
  currency: "USD",
  "order-description": "Online contribution from Apollos",
  "customer-id": "1573550949",
  "customer-vault-id": "1573550949",
  "merchant-defined-field-1": "128,136",
  "merchant-defined-field-2": "3",
  "merchant-defined-field-3": "20150101",
  "merchant-defined-field-4": "1.08,1000.54",
  "order-id": "apollos_1480730692765_63167",
  "tax-amount": "0.00",
  "shipping-amount": "0.00",
  billing: {
    "billing-id": "1479728788",
    "first-name": "James",
    "last-name": "Baxley",
    address1: "808 Pebble Ln",
    city: "Anderson",
    state: "SC",
    postal: "29621-3452",
    email: "james.baxley@newspring.cc",
    "account-number": 1111111111,
    "routing-number": 111111111,
    "account-type": "checking",
    priority: "1",
  },
  shipping: {
    "shipping-id": "1620191627",
    priority: "1",
  },
  plan: {
    payments: 0,
    amount: 1.02,
    "plan-id": ";aljdflakf",
    "day-frequency": 1,
    "month-frequency": 2,
    "day-of-month": 1,
  },
};
