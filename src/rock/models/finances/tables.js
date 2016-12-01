/* tslint:disable:no-shadowed-variable */

import {
  INTEGER,
  STRING,
  BOOLEAN,
  DATE,
  FLOAT,
} from "sequelize";

import { MSSQLConnector } from "../../mssql";

const transactionSchema = {
  Id: { type: INTEGER, primaryKey: true },
  TransactionDateTime: { type: DATE },
  TransactionCode: { type: STRING },
  Summary: { type: STRING },
  TransactionTypeValueId: { type: INTEGER },
  SourceTypeValueId: { type: INTEGER },
  ScheduledTransactionId: { type: INTEGER },
  CreatedDateTime: { type: DATE },
  ModifiedDateTime: { type: DATE },
  ProcessedDateTime: { type: DATE },
  AuthorizedPersonAliasId: { type: INTEGER },
  FinancialGatewayId: { type: INTEGER },
  FinancialPaymentDetailId: { type: INTEGER },
  Status: { type: STRING },
  StatusMessage: { type: STRING },
};

const transactionRefundSchema = {
  Id: { type: INTEGER, primaryKey: true },
  RefundReasonValueId: { type: INTEGER },
  RefundReasonSummary: { type: STRING },
  CreatedDateTime: { type: DATE },
  ModifiedDateTime: { type: DATE },
  OriginalTransactionId: { type: INTEGER },
};

const transactionDetailSchema = {
  Id: { type: INTEGER, primaryKey: true },
  TransactionId: { type: INTEGER },
  AccountId: { type: INTEGER },
  Amount: { type: FLOAT },
  Summary: { type: STRING },
  CreatedDateTime: { type: DATE },
  ModifiedDateTime: { type: DATE },
};

const scheduledTransactionSchema = {
  Id: { type: INTEGER, primaryKey: true },
  TransactionFrequencyValueId: { type: INTEGER },
  StartDate: { type: DATE },
  EndDate: { type: DATE },
  NumberOfPayments: { type: INTEGER },
  NextPaymentDate: { type: DATE },
  LastStatusUpdateDateTime: { type: DATE },
  IsActive: { type: BOOLEAN },
  TransactionCode: { type: STRING },
  GatewayScheduleId: { type: STRING },
  CardReminderDate: { type: DATE },
  LastRemindedDate: { type: DATE },
  CreatedDateTime: { type: DATE },
  ModifiedDateTime: { type: DATE },
  AuthorizedPersonAliasId: { type: INTEGER },
  FinancialGatewayId: { type: INTEGER },
  FinancialPaymentDetailId: { type: INTEGER },
  // SourceTypeValueId: { type: INTEGER },
};

const scheduledTransactionDetailSchema = {
  Id: { type: INTEGER, primaryKey: true },
  ScheduledTransactionId: { type: INTEGER },
  AccountId: { type: INTEGER },
  Amount: { type: FLOAT },
  Summary: { type: STRING },
  CreatedDateTime: { type: DATE },
  ModifiedDateTime: { type: DATE },
};

const savedPaymentSchema = {
  Id: { type: INTEGER, primaryKey: true },
  ReferenceNumber: { type: STRING },
  Name: { type: STRING },
  TransactionCode: { type: STRING },
  CreatedDateTime: { type: DATE },
  ModifiedDateTime: { type: DATE },
  PersonAliasId: { type: INTEGER },
  FinancialGatewayId: { type: INTEGER },
  FinancialPaymentDetailId: { type: INTEGER },
};

const financialAccountSchema = {
  Id: { type: INTEGER, primaryKey: true },
  ParentAccountId: { type: INTEGER },
  CampusId: { type: INTEGER },
  Name: { type: STRING },
  PublicName: { type: STRING },
  Description: { type: STRING },
  IsTaxDeductible: { type: BOOLEAN },
  Order: { type: INTEGER },
  IsActive: { type: BOOLEAN },
  StartDate: { type: DATE },
  EndDate: { type: DATE },
  AccountTypeValueId: { type: INTEGER },
  CreatedDateTime: { type: DATE },
  ModifiedDateTime: { type: DATE },
  ImageBinaryFileId: { type: INTEGER },
  Url: { type: STRING },
  PublicDescription: { type: STRING },
  IsPublic: { type: BOOLEAN },
};

const financialPaymentDetailSchema = {
  Id: { type: INTEGER, primaryKey: true },
  AccountNumberMasked: { type: STRING },
  CurrencyTypeValueId: { type: INTEGER },
  CreditCardTypeValueId: { type: INTEGER },
  CreatedDateTime: { type: DATE },
  ModifiedDateTime: { type: DATE },
};

const financialGatewaySchema = {
  Id: { type: INTEGER, primaryKey: true },
  Name: { type: STRING },
  Description: { type: STRING },
  IsActive: { type: BOOLEAN },
  CreatedDateTime: { type: DATE },
  ModifiedDateTime: { type: DATE },
};

const financialBatchSchema = {
  Id: { type: INTEGER, primaryKey: true },
  BatchEndDateTime: { type: DATE },
  BatchStartDateTime: { type: DATE },
  CampusId: { type: INTEGER },
  Name: { type: STRING },
  Status: { type: STRING },
};


// FinancialAccounts,
let Transaction;
let TransactionRefund;
let TransactionDetail;
let ScheduledTransaction;
let ScheduledTransactionDetail;
let SavedPayment;
let FinancialAccount;
let FinancialPaymentDetail;
let FinancialGateway;
let FinancialBatch;
export {
  Transaction,
  transactionSchema,

  TransactionRefund,
  transactionRefundSchema,

  TransactionDetail,
  transactionDetailSchema,

  ScheduledTransaction,
  scheduledTransactionSchema,

  ScheduledTransactionDetail,
  scheduledTransactionDetailSchema,

  SavedPayment,
  savedPaymentSchema,

  FinancialAccount,
  financialAccountSchema,

  FinancialPaymentDetail,

  FinancialGateway,
  financialGatewaySchema,

  FinancialBatch,
  financialBatchSchema,
};

export function connect() {
  Transaction = new MSSQLConnector("FinancialTransaction", transactionSchema);
  TransactionRefund = new MSSQLConnector("FinancialTransactionRefund", transactionRefundSchema);
  TransactionDetail = new MSSQLConnector("FinancialTransactionDetail", transactionDetailSchema);
  ScheduledTransaction = new MSSQLConnector(
    "FinancialScheduledTransaction", scheduledTransactionSchema,
  );
  ScheduledTransactionDetail = new MSSQLConnector(
    "FinancialScheduledTransactionDetail", scheduledTransactionDetailSchema,
  );
  SavedPayment = new MSSQLConnector("FinancialPersonSavedAccount", savedPaymentSchema);
  FinancialAccount = new MSSQLConnector("FinancialAccount", financialAccountSchema);
  FinancialPaymentDetail = new MSSQLConnector(
    "FinancialPaymentDetail", financialPaymentDetailSchema,
  );
  FinancialGateway = new MSSQLConnector("FinancialGateway", financialGatewaySchema);
  FinancialBatch = new MSSQLConnector("FinancialBatch", financialBatchSchema, {}, "FinancialBatches");

  return {
    Transaction,
    TransactionRefund,
    TransactionDetail,
    ScheduledTransaction,
    ScheduledTransactionDetail,
    SavedPayment,
    FinancialAccount,
    FinancialGateway,
    FinancialPaymentDetail,
    FinancialBatch,
  };
}

export function bind({
  PersonAlias,
  Transaction,
  TransactionRefund,
  TransactionDetail,
  ScheduledTransaction,
  ScheduledTransactionDetail,
  SavedPayment,
  // FinancialAccount,
  // FinancialGateway,
}) {
  Transaction.model.belongsTo(PersonAlias.model, {
    foreignKey: "AuthorizedPersonAliasId", targetKey: "Id",
  });

  PersonAlias.model.hasMany(Transaction.model, {
    foreignKey: "AuthorizedPersonAliasId",
  });

  TransactionRefund.model.belongsTo(Transaction.model, {
    foreignKey: "OriginalTransactionId", targetKey: "Id",
  });

  Transaction.model.hasMany(TransactionDetail.model, { foreignKey: "TransactionId" });
  TransactionDetail.model.belongsTo(Transaction.model, {
    foreignKey: "TransactionId", targetKey: "Id",
  });

  ScheduledTransaction.model.hasMany(Transaction.model, { foreignKey: "Id" });
  Transaction.model.belongsTo(ScheduledTransaction.model, {
    foreignKey: "ScheduledTransactionId", targetKey: "Id",
  });

  ScheduledTransaction.model.hasMany(ScheduledTransactionDetail.model, { foreignKey: "ScheduledTransactionId" });
  ScheduledTransactionDetail.model.belongsTo(ScheduledTransaction.model, {
    foreignKey: "ScheduledTransactionId", targetKey: "Id",
  });

  SavedPayment.model.belongsTo(PersonAlias.model, {
    foreignKey: "PersonAliasId", targetKey: "Id",
  });

  // FinancialGateway.model.
}

export default {
  connect,
  bind,
};
