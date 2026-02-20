const Transaction = require("../models/transactions");
const SavingsAccount = require("../models/savingsAccounts");
const Loan = require("../models/loans");
const { Op } = require("sequelize");

/**
 * Get transaction history
 */
exports.getTransactions = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { accountId, loanId, transactionType, startDate, endDate, page = 1, limit = 20 } = req.query;

    // Build where clause
    const where = {};

    // If accountId provided, verify user owns the account
    if (accountId) {
      const account = await SavingsAccount.findOne({
        where: {
          accountId,
          userId,
        },
      });

      if (!account) {
        return res.status(404).json({
          message: "Account not found",
        });
      }

      where.accountId = accountId;
    }

    // If loanId provided, verify user owns the loan
    if (loanId) {
      const loan = await Loan.findOne({
        where: {
          loanId,
          borrowerId: userId,
        },
      });

      if (!loan) {
        return res.status(404).json({
          message: "Loan not found",
        });
      }

      where.loanId = loanId;
    }

    // If neither accountId nor loanId provided, get all user's transactions
    if (!accountId && !loanId) {
      // Get user's account IDs
      const accounts = await SavingsAccount.findAll({
        where: { userId },
        attributes: ["accountId"],
      });
      const accountIds = accounts.map((acc) => acc.accountId);

      // Get user's loan IDs
      const loans = await Loan.findAll({
        where: { borrowerId: userId },
        attributes: ["loanId"],
      });
      const loanIds = loans.map((loan) => loan.loanId);

      where[Op.or] = [
        { accountId: { [Op.in]: accountIds } },
        { loanId: { [Op.in]: loanIds } },
      ];
    }

    if (transactionType) {
      where.transactionType = transactionType;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        where.createdAt[Op.lte] = new Date(endDate);
      }
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Transaction.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset,
      include: [
        {
          model: SavingsAccount,
          as: "account",
          attributes: ["accountNumber"],
          required: false,
        },
        {
          model: Loan,
          as: "loan",
          attributes: ["loanNumber"],
          required: false,
        },
      ],
    });

    res.status(200).json({
      message: "Transactions retrieved successfully",
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
      transactions: rows.map((transaction) => ({
        transactionId: transaction.transactionId,
        accountNumber: transaction.account?.accountNumber || null,
        loanNumber: transaction.loan?.loanNumber || null,
        transactionType: transaction.transactionType,
        amount: parseFloat(transaction.amount),
        balanceBefore: transaction.balanceBefore
          ? parseFloat(transaction.balanceBefore)
          : null,
        balanceAfter: transaction.balanceAfter
          ? parseFloat(transaction.balanceAfter)
          : null,
        description: transaction.description,
        referenceNumber: transaction.referenceNumber,
        status: transaction.status,
        createdAt: transaction.createdAt,
      })),
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get a specific transaction by ID
 */
exports.getTransaction = async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.userId;

    const transaction = await Transaction.findByPk(transactionId, {
      include: [
        {
          model: SavingsAccount,
          as: "account",
          attributes: ["accountId", "accountNumber", "userId"],
          required: false,
        },
        {
          model: Loan,
          as: "loan",
          attributes: ["loanId", "loanNumber", "borrowerId"],
          required: false,
        },
      ],
    });

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    // Verify user owns the account or loan
    const ownsAccount =
      transaction.account && transaction.account.userId === userId;
    const ownsLoan =
      transaction.loan && transaction.loan.borrowerId === userId;

    if (!ownsAccount && !ownsLoan) {
      return res.status(403).json({
        message: "Access denied. You do not own this transaction.",
      });
    }

    res.status(200).json({
      message: "Transaction retrieved successfully",
      transaction: {
        transactionId: transaction.transactionId,
        accountNumber: transaction.account?.accountNumber || null,
        loanNumber: transaction.loan?.loanNumber || null,
        transactionType: transaction.transactionType,
        amount: parseFloat(transaction.amount),
        balanceBefore: transaction.balanceBefore
          ? parseFloat(transaction.balanceBefore)
          : null,
        balanceAfter: transaction.balanceAfter
          ? parseFloat(transaction.balanceAfter)
          : null,
        description: transaction.description,
        referenceNumber: transaction.referenceNumber,
        status: transaction.status,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      },
    });
  } catch (error) {
    return next(error);
  }
};
