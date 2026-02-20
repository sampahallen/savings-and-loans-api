const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const User = require("./users");

const SavingsAccount = sequelize.define(
  "SavingsAccount",
  {
    accountId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      field: "account_id",
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "user_id",
      references: {
        model: User,
        key: "userId",
      },
    },
    accountNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      field: "account_number",
    },
    balance: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.0,
      validate: {
        min: 0,
      },
    },
    accountType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "regular",
      field: "account_type",
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "active",
    },
  },
  {
    tableName: "savings_accounts",
    timestamps: true,
    underscored: true,
  }
);

// Associations
SavingsAccount.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

User.hasMany(SavingsAccount, {
  foreignKey: "userId",
  as: "savingsAccounts",
});

module.exports = SavingsAccount;
