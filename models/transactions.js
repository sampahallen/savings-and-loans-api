const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const SavingsAccount = require("./savingsAccounts");
const Loan = require("./loans");

const Transaction = sequelize.define(
  "Transaction",
  {
    transactionId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      field: "transaction_id",
    },
    accountId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "account_id",
      references: {
        model: SavingsAccount,
        key: "accountId",
      },
    },
    loanId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "loan_id",
      references: {
        model: Loan,
        key: "loanId",
      },
    },
    transactionType: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "transaction_type",
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
    },
    balanceBefore: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      field: "balance_before",
    },
    balanceAfter: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      field: "balance_after",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    referenceNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
      field: "reference_number",
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "completed",
    },
  },
  {
    tableName: "transactions",
    timestamps: true,
    underscored: true,
  }
);

// Associations
Transaction.belongsTo(SavingsAccount, {
  foreignKey: "accountId",
  as: "account",
});

Transaction.belongsTo(Loan, {
  foreignKey: "loanId",
  as: "loan",
});

SavingsAccount.hasMany(Transaction, {
  foreignKey: "accountId",
  as: "transactions",
});

Loan.hasMany(Transaction, {
  foreignKey: "loanId",
  as: "transactions",
});

module.exports = Transaction;
