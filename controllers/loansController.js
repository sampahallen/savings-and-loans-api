const Loan = require("../models/loans");
const Transaction = require("../models/transactions");
const SavingsAccount = require("../models/savingsAccounts");
const { Op } = require("sequelize");

/**
 * Generate unique loan number
 */
const generateLoanNumber = () => {
  const prefix = "LOAN";
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `${prefix}${timestamp}${random}`;
};

/**
 * Calculate loan details (total amount, monthly payment, etc.)
 */
const calculateLoanDetails = (principalAmount, interestRate, termMonths) => {
  const principal = parseFloat(principalAmount);
  const rate = parseFloat(interestRate) / 100 / 12; // Monthly interest rate
  const term = parseInt(termMonths);

  // Calculate monthly payment using amortization formula
  const monthlyPayment =
    (principal * rate * Math.pow(1 + rate, term)) /
    (Math.pow(1 + rate, term) - 1);

  const totalAmount = monthlyPayment * term;

  return {
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
    remainingBalance: parseFloat(totalAmount.toFixed(2)),
  };
};

/**
 * Apply for a loan
 */
exports.applyForLoan = async (req, res, next) => {
  try {
    const { principalAmount, interestRate, termMonths, purpose } = req.body;
    const borrowerId = req.user.userId;

    // Validation
    if (!principalAmount || principalAmount <= 0) {
      return res.status(400).json({
        message: "Principal amount must be greater than 0",
      });
    }

    if (!termMonths || termMonths < 1) {
      return res.status(400).json({
        message: "Loan term must be at least 1 month",
      });
    }

    // Default interest rate if not provided (could be from config)
    const rate = interestRate || 12.0; // 12% default annual rate

    // Calculate loan details
    const loanDetails = calculateLoanDetails(
      principalAmount,
      rate,
      termMonths
    );

    // Generate unique loan number
    let loanNumber;
    let isUnique = false;
    while (!isUnique) {
      loanNumber = generateLoanNumber();
      const exists = await Loan.findOne({ where: { loanNumber } });
      if (!exists) {
        isUnique = true;
      }
    }

    // Calculate due date
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + termMonths);

    // Create loan application
    const loan = await Loan.create({
      borrowerId,
      loanNumber,
      principalAmount: parseFloat(principalAmount),
      interestRate: rate,
      termMonths,
      totalAmount: loanDetails.totalAmount,
      remainingBalance: loanDetails.remainingBalance,
      monthlyPayment: loanDetails.monthlyPayment,
      status: "pending",
      dueDate,
    });

    res.status(201).json({
      message: "Loan application submitted successfully",
      loan: {
        loanId: loan.loanId,
        loanNumber: loan.loanNumber,
        principalAmount: parseFloat(loan.principalAmount),
        interestRate: parseFloat(loan.interestRate),
        termMonths: loan.termMonths,
        totalAmount: parseFloat(loan.totalAmount),
        monthlyPayment: parseFloat(loan.monthlyPayment),
        status: loan.status,
        dueDate: loan.dueDate,
        createdAt: loan.createdAt,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get all loans for the authenticated user
 */
exports.getMyLoans = async (req, res, next) => {
  try {
    const borrowerId = req.user.userId;
    const { status } = req.query;

    const where = { borrowerId };
    if (status) {
      where.status = status;
    }

    const loans = await Loan.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      message: "Loans retrieved successfully",
      loans: loans.map((loan) => ({
        loanId: loan.loanId,
        loanNumber: loan.loanNumber,
        principalAmount: parseFloat(loan.principalAmount),
        interestRate: parseFloat(loan.interestRate),
        termMonths: loan.termMonths,
        totalAmount: parseFloat(loan.totalAmount),
        remainingBalance: parseFloat(loan.remainingBalance),
        monthlyPayment: parseFloat(loan.monthlyPayment),
        status: loan.status,
        approvedAt: loan.approvedAt,
        disbursedAt: loan.disbursedAt,
        dueDate: loan.dueDate,
        createdAt: loan.createdAt,
      })),
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get a specific loan by ID
 */
exports.getLoan = async (req, res, next) => {
  try {
    const { loanId } = req.params;
    const borrowerId = req.user.userId;

    const loan = await Loan.findOne({
      where: {
        loanId,
        borrowerId, // Ensure user owns this loan
      },
    });

    if (!loan) {
      return res.status(404).json({
        message: "Loan not found",
      });
    }

    res.status(200).json({
      message: "Loan retrieved successfully",
      loan: {
        loanId: loan.loanId,
        loanNumber: loan.loanNumber,
        principalAmount: parseFloat(loan.principalAmount),
        interestRate: parseFloat(loan.interestRate),
        termMonths: loan.termMonths,
        totalAmount: parseFloat(loan.totalAmount),
        remainingBalance: parseFloat(loan.remainingBalance),
        monthlyPayment: parseFloat(loan.monthlyPayment),
        status: loan.status,
        approvedBy: loan.approvedBy,
        approvedAt: loan.approvedAt,
        disbursedAt: loan.disbursedAt,
        dueDate: loan.dueDate,
        createdAt: loan.createdAt,
        updatedAt: loan.updatedAt,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Approve a loan (loan officer/admin only)
 */
exports.approveLoan = async (req, res, next) => {
  const t = await Loan.sequelize.transaction();

  try {
    const { loanId } = req.params;
    const approverId = req.user.userId;

    const loan = await Loan.findOne({
      where: {
        loanId,
        status: "pending",
      },
      transaction: t,
    });

    if (!loan) {
      await t.rollback();
      return res.status(404).json({
        message: "Loan not found or already processed",
      });
    }

    // Update loan status
    await loan.update(
      {
        status: "approved",
        approvedBy: approverId,
        approvedAt: new Date(),
      },
      { transaction: t }
    );

    await t.commit();

    res.status(200).json({
      message: "Loan approved successfully",
      loan: {
        loanId: loan.loanId,
        loanNumber: loan.loanNumber,
        status: "approved",
        approvedAt: loan.approvedAt,
      },
    });
  } catch (error) {
    await t.rollback();
    return next(error);
  }
};

/**
 * Disburse loan funds (loan officer/admin only)
 */
exports.disburseLoan = async (req, res, next) => {
  const t = await Loan.sequelize.transaction();

  try {
    const { loanId } = req.params;
    const { accountId } = req.body; // Account to disburse funds to

    const loan = await Loan.findOne({
      where: {
        loanId,
        status: "approved",
      },
      transaction: t,
    });

    if (!loan) {
      await t.rollback();
      return res.status(404).json({
        message: "Loan not found or not approved",
      });
    }

    // Find borrower's account
    const account = await SavingsAccount.findOne({
      where: {
        accountId,
        userId: loan.borrowerId,
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
    const balanceAfter = balanceBefore + parseFloat(loan.principalAmount);

    // Update account balance
    await account.update(
      {
        balance: balanceAfter,
      },
      { transaction: t }
    );

    // Update loan status
    await loan.update(
      {
        status: "active",
        disbursedAt: new Date(),
      },
      { transaction: t }
    );

    // Create transaction record
    await Transaction.create(
      {
        accountId: account.accountId,
        loanId: loan.loanId,
        transactionType: "loan_disbursement",
        amount: parseFloat(loan.principalAmount),
        balanceBefore,
        balanceAfter,
        description: `Loan disbursement - ${loan.loanNumber}`,
        status: "completed",
      },
      { transaction: t }
    );

    await t.commit();

    res.status(200).json({
      message: "Loan disbursed successfully",
      loan: {
        loanId: loan.loanId,
        loanNumber: loan.loanNumber,
        status: "active",
        disbursedAt: loan.disbursedAt,
      },
      account: {
        accountNumber: account.accountNumber,
        newBalance: balanceAfter,
      },
    });
  } catch (error) {
    await t.rollback();
    return next(error);
  }
};

/**
 * Make loan repayment
 */
exports.repayLoan = async (req, res, next) => {
  const t = await Loan.sequelize.transaction();

  try {
    const { loanId } = req.params;
    const { amount, accountId } = req.body;
    const borrowerId = req.user.userId;

    if (!amount || amount <= 0) {
      await t.rollback();
      return res.status(400).json({
        message: "Amount must be greater than 0",
      });
    }

    // Find loan
    const loan = await Loan.findOne({
      where: {
        loanId,
        borrowerId,
        status: "active",
      },
      transaction: t,
    });

    if (!loan) {
      await t.rollback();
      return res.status(404).json({
        message: "Loan not found or not active",
      });
    }

    // Find account
    const account = await SavingsAccount.findOne({
      where: {
        accountId,
        userId: borrowerId,
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

    const repaymentAmount = parseFloat(amount);
    const balanceBefore = parseFloat(account.balance);

    // Check sufficient balance
    if (balanceBefore < repaymentAmount) {
      await t.rollback();
      return res.status(400).json({
        message: "Insufficient balance",
        currentBalance: balanceBefore,
        requestedAmount: repaymentAmount,
      });
    }

    const balanceAfter = balanceBefore - repaymentAmount;
    const remainingBalance = parseFloat(loan.remainingBalance) - repaymentAmount;

    // Update account balance
    await account.update(
      {
        balance: balanceAfter,
      },
      { transaction: t }
    );

    // Update loan balance
    const updateData = {
      remainingBalance: remainingBalance >= 0 ? remainingBalance : 0,
    };

    if (remainingBalance <= 0) {
      updateData.status = "completed";
    }

    await loan.update(updateData, { transaction: t });

    // Create transaction record
    await Transaction.create(
      {
        accountId: account.accountId,
        loanId: loan.loanId,
        transactionType: "loan_repayment",
        amount: repaymentAmount,
        balanceBefore,
        balanceAfter,
        description: `Loan repayment - ${loan.loanNumber}`,
        status: "completed",
      },
      { transaction: t }
    );

    await t.commit();

    res.status(200).json({
      message: "Loan repayment successful",
      loan: {
        loanId: loan.loanId,
        loanNumber: loan.loanNumber,
        remainingBalance: updateData.remainingBalance,
        status: updateData.status || loan.status,
      },
      transaction: {
        amount: repaymentAmount,
        balanceAfter,
      },
    });
  } catch (error) {
    await t.rollback();
    return next(error);
  }
};
