const SavingsAccount = require("../models/savingsAccounts");
const Transaction = require("../models/transactions");
const { Op } = require("sequelize");

/**
 * Generate unique account number
 */
const generateAccountNumber = () => {
  const prefix = "SAV";
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `${prefix}${timestamp}${random}`;
};

/**
 * Create a new savings account
 */
exports.createAccount = async (req, res, next) => {
  try {
    const { accountType } = req.body;
    const userId = req.user.userId;

    // Check if user already has an account of this type
    const existingAccount = await SavingsAccount.findOne({
      where: {
        userId,
        accountType: accountType || "regular",
        status: { [Op.ne]: "closed" },
      },
    });

    if (existingAccount) {
      return res.status(400).json({
        message: `You already have an active ${accountType || "regular"} account`,
      });
    }

    // Generate unique account number
    let accountNumber;
    let isUnique = false;
    while (!isUnique) {
      accountNumber = generateAccountNumber();
      const exists = await SavingsAccount.findOne({ where: { accountNumber } });
      if (!exists) {
        isUnique = true;
      }
    }

    // Create account
    const account = await SavingsAccount.create({
      userId,
      accountNumber,
      balance: 0.0,
      accountType: accountType || "regular",
      status: "active",
    });

    res.status(201).json({
      message: "Savings account created successfully",
      account: {
        accountId: account.accountId,
        accountNumber: account.accountNumber,
        balance: account.balance,
        accountType: account.accountType,
        status: account.status,
        createdAt: account.createdAt,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get all savings accounts for the authenticated user
 */
exports.getMyAccounts = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const accounts = await SavingsAccount.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      message: "Accounts retrieved successfully",
      accounts: accounts.map((account) => ({
        accountId: account.accountId,
        accountNumber: account.accountNumber,
        balance: parseFloat(account.balance),
        accountType: account.accountType,
        status: account.status,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
      })),
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get a specific account by ID
 */
exports.getAccount = async (req, res, next) => {
  try {
    const { accountId } = req.params;
    const userId = req.user.userId;

    const account = await SavingsAccount.findOne({
      where: {
        accountId,
        userId, // Ensure user owns this account
      },
    });

    if (!account) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    res.status(200).json({
      message: "Account retrieved successfully",
      account: {
        accountId: account.accountId,
        accountNumber: account.accountNumber,
        balance: parseFloat(account.balance),
        accountType: account.accountType,
        status: account.status,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Deposit money into account
 */
exports.deposit = async (req, res, next) => {
  const t = await SavingsAccount.sequelize.transaction();

  try {
    const { accountId } = req.params;
    const { amount, description } = req.body;
    const userId = req.user.userId;

    if (!amount || amount <= 0) {
      await t.rollback();
      return res.status(400).json({
        message: "Amount must be greater than 0",
      });
    }

    // Find account
    const account = await SavingsAccount.findOne({
      where: {
        accountId,
        userId,
        status: "active",
      },
      transaction: t,
    });

    if (!account) {
      await t.rollback();
      return res.status(404).json({
        message: "Account not found or inactive",
      });
    }

    const balanceBefore = parseFloat(account.balance);
    const balanceAfter = balanceBefore + parseFloat(amount);

    // Update account balance
    await account.update(
      {
        balance: balanceAfter,
      },
      { transaction: t }
    );

    // Create transaction record
    const transaction = await Transaction.create(
      {
        accountId: account.accountId,
        transactionType: "deposit",
        amount: parseFloat(amount),
        balanceBefore,
        balanceAfter,
        description: description || "Deposit",
        status: "completed",
      },
      { transaction: t }
    );

    await t.commit();

    res.status(200).json({
      message: "Deposit successful",
      transaction: {
        transactionId: transaction.transactionId,
        accountNumber: account.accountNumber,
        transactionType: transaction.transactionType,
        amount: parseFloat(transaction.amount),
        balanceBefore,
        balanceAfter,
        description: transaction.description,
        createdAt: transaction.createdAt,
      },
    });
  } catch (error) {
    await t.rollback();
    return next(error);
  }
};

/**
 * Withdraw money from account
 */
exports.withdraw = async (req, res, next) => {
  const t = await SavingsAccount.sequelize.transaction();

  try {
    const { accountId } = req.params;
    const { amount, description } = req.body;
    const userId = req.user.userId;

    if (!amount || amount <= 0) {
      await t.rollback();
      return res.status(400).json({
        message: "Amount must be greater than 0",
      });
    }

    // Find account
    const account = await SavingsAccount.findOne({
      where: {
        accountId,
        userId,
        status: "active",
      },
      transaction: t,
    });

    if (!account) {
      await t.rollback();
      return res.status(404).json({
        message: "Account not found or inactive",
      });
    }

    const balanceBefore = parseFloat(account.balance);
    const withdrawalAmount = parseFloat(amount);

    // Check sufficient balance
    if (balanceBefore < withdrawalAmount) {
      await t.rollback();
      return res.status(400).json({
        message: "Insufficient balance",
        currentBalance: balanceBefore,
        requestedAmount: withdrawalAmount,
      });
    }

    const balanceAfter = balanceBefore - withdrawalAmount;

    // Update account balance
    await account.update(
      {
        balance: balanceAfter,
      },
      { transaction: t }
    );

    // Create transaction record
    const transaction = await Transaction.create(
      {
        accountId: account.accountId,
        transactionType: "withdrawal",
        amount: withdrawalAmount,
        balanceBefore,
        balanceAfter,
        description: description || "Withdrawal",
        status: "completed",
      },
      { transaction: t }
    );

    await t.commit();

    res.status(200).json({
      message: "Withdrawal successful",
      transaction: {
        transactionId: transaction.transactionId,
        accountNumber: account.accountNumber,
        transactionType: transaction.transactionType,
        amount: parseFloat(transaction.amount),
        balanceBefore,
        balanceAfter,
        description: transaction.description,
        createdAt: transaction.createdAt,
      },
    });
  } catch (error) {
    await t.rollback();
    return next(error);
  }
};
