export const standard = {
  "transaction_id": "1",
  "transaction_type": "cc",
  "condition": "complete",
  "order_id": "apollos_1",
  "authorization_code": "111111",
  "order_description": "Online contribution",
  "first_name": "First",
  "last_name": "Last",
  "address_1": "Address",
  "city": "City",
  "state": "SC",
  "postal_code": "29621",
  "email": "test@email.com",
  "customerid": "1",
  "shipping": "0.00",
  "cc_number": "4xxxxxxxxxxx1111",
  "cc_hash": "111111111111111111111111111111",
  "cc_exp": "0109",
  "avs_response": "Z",
  "processor_id": "newspringchurch",
  "tax": "0.00",
  "currency": "USD",
  "entry_mode": "Keyed",
  "merchant_defined_field": [
    { id: "2", _: "16" },
  ],
  "cc_bin": "111111",
  "product": {
    "sku": "125",
    "quantity": "1.0000",
    "description": "General Fund",
  },
  "action": {
    "amount": "1.00",
    "action_type": "sale",
    "date": "20161102090845",
    "success": "1",
    "ip_address": "75.139.120.52",
    "source": "api",
    "username": "ahaskett1",
    "response_text": "AP",
    "batch_id": "0",
    "response_code": "100",
    "processor_response_text": "AP",
    "processor_response_code": "000",
    "requested_amount": "1",
  },
};

export const check = {
  "transaction_id": "1",
  "transaction_type": "ck",
  "condition": "complete",
  "order_id": "apollos_1",
  "authorization_code": "111111",
  "order_description": "Online contribution",
  "first_name": "First",
  "last_name": "Last",
  "address_1": "Address",
  "city": "City",
  "state": "SC",
  "postal_code": "29621",
  "email": "test@email.com",
  "customerid": "1",
  "shipping": "0.00",
  "check_account": "1xxxx1111",
  "check_hash": "10",
  "check_aba": "111111111",
  "check_name": "My Check",
  "account_holder_type": "personal",
  "account_type": "checking",
  "sec_code": "WEB",
  "avs_response": "Z",
  "processor_id": "newspringchurch",
  "tax": "0.00",
  "currency": "USD",
  "entry_mode": "Keyed",
  "merchant_defined_field": [
    { id: "2", _: "16" },
  ],
  "cc_bin": "111111",
  "product": {
    "sku": "125",
    "quantity": "1.0000",
    "description": "General Fund",
  },
  "action": {
    "amount": "1.00",
    "action_type": "sale",
    "date": "20161102090845",
    "success": "1",
    "ip_address": "75.139.120.52",
    "source": "api",
    "username": "ahaskett1",
    "response_text": "AP",
    "batch_id": "0",
    "response_code": "100",
    "processor_response_text": "AP",
    "processor_response_code": "000",
    "requested_amount": "1",
  },
};


export const recurring = {
  "transaction_id": "1",
  "original_transaction_id": "10",
  "transaction_type": "cc",
  "condition": "complete",
  "order_id": "apollos_1",
  "authorization_code": "111111",
  "order_description": "Online contribution",
  "first_name": "First",
  "last_name": "Last",
  "address_1": "Address",
  "city": "City",
  "state": "SC",
  "postal_code": "29621",
  "email": "test@email.com",
  "customerid": "1",
  "shipping": "0.00",
  "cc_number": "4xxxxxxxxxxx1111",
  "cc_hash": "111111111111111111111111111111",
  "cc_exp": "0109",
  "avs_response": "Z",
  "processor_id": "newspringchurch",
  "tax": "0.00",
  "currency": "USD",
  "entry_mode": "Keyed",
  "merchant_defined_field": [
    { id: "2", _: "16" },
    { id: "1", _: "128" },
  ],
  "cc_bin": "111111",
  "product": {
    "sku": "125",
    "quantity": "1.0000",
    "description": "General Fund",
  },
  "action": {
    "amount": "1.00",
    "action_type": "sale",
    "date": "20161102090845",
    "success": "1",
    "ip_address": "75.139.120.52",
    "source": "recurring",
    "username": "ahaskett1",
    "response_text": "AP",
    "batch_id": "0",
    "response_code": "100",
    "processor_response_text": "AP",
    "processor_response_code": "000",
    "requested_amount": "1",
  },
};

export const NMIExample = {
  "transaction_id": "2612675976",
  "transaction_type": "cc",
  "condition": "complete",
  "order_id": "1234567890",
  "authorization_code": "123456",
  "first_name": "John",
  "last_name": "Smith",
  "address_1": "123 Main St",
  "address_2": "Apt B",
  "city": "New York City",
  "state": "NY",
  "postal_code": "10001",
  "country": "US",
  "email": "johnsmith@example.com",
  "phone": "1234567890",
  "shipping": "1.00",
  "cc_number": "4xxxxxxxxxxx1111",
  "cc_hash": "f6c609e195d9d4c185dcc8ca662f0180",
  "cc_exp": "1215",
  "avs_response": "N",
  "csc_response": "M",
  "processor_id": "processora",
  "tax": "1.00",
  "currency": "USD",
  "entry_mode": "Keyed",
  "cc_bin": "411111",
  "product": {
    "sku": "RS-100",
    "quantity": "1.0000",
    "description": "Red Shirt",
    "amount": "10.0000",
  },
  "action": [
    {
      "amount": "11.00",
      "action_type": "sale",
      "date": "20150312215205",
      "success": "1",
      "ip_address": "1.1.1.1",
      "source": "virtual_terminal",
      "username": "demo",
      "response_text": "SUCCESS",
      "batch_id": "0",
      "response_code": "100",
      "processor_response_text": "NO MATCH",
      "processor_response_code": "00",
      "requested_amount": "11.00",
    },
    {
      "amount": "11.00",
      "action_type": "level3",
      "date": "20150312215205",
      "success": "1",
      "ip_address": "1.1.1.1",
      "source": "virtual_terminal",
      "username": "demo",
      "batch_id": "0",
      "response_code": "100",
    },
    {
      "amount": "11.00",
      "action_type": "settle",
      "date": "20150313171503",
      "success": "1",
      "source": "internal",
      "response_text": "ACCEPTED",
      "batch_id": "76158269",
      "processor_batch_id": "782",
      "response_code": "100",
      "processor_response_code": "0000000000021980",
    },
  ],
};
