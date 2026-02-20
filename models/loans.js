const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const User = require("./users");

const Loan = sequelize.define(
  "Loan",
  {
    loanId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      field: "loan_id",
    },
    borrowerId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "borrower_id",
      references: {
        model: User,
        key: "userId",
      },
    },
    loanNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      field: "loan_number",
    },
    principalAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      field: "principal_amount",
      validate: {
        min: 0.01,
      },
    },
    interestRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      field: "interest_rate",
      validate: {
        min: 0,
        max: 100,
      },
    },
    termMonths: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "term_months",
      validate: {
        min: 1,
      },
    },
    totalAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      field: "total_amount",
    },
    remainingBalance: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      field: "remaining_balance",
      validate: {
        min: 0,
      },
    },
    monthlyPayment: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      field: "monthly_payment",
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending",
    },
    approvedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "approved_by",
      references: {
        model: User,
        key: "userId",
      },
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "approved_at",
    },
    disbursedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "disbursed_at",
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "due_date",
    },
  },
  {
    tableName: "loans",
    timestamps: true,
    underscored: true,
  }
);

// Associations
Loan.belongsTo(User, {
  foreignKey: "borrowerId",
  as: "borrower",
});

Loan.belongsTo(User, {
  foreignKey: "approvedBy",
  as: "approver",
});

User.hasMany(Loan, {
  foreignKey: "borrowerId",
  as: "loans",
});

module.exports = Loan;
