const express = require("express");
const route = express.Router();
const loansController = require("../controllers/loansController");
const { authenticate, requireRole } = require("../middlewares/auth");

// All routes require authentication
route.use(authenticate);

// Customer routes
route.post("/apply", loansController.applyForLoan);
route.get("/my-loans", loansController.getMyLoans);
route.get("/:loanId", loansController.getLoan);
route.post("/:loanId/repay", loansController.repayLoan);

// Loan officer/admin routes
route.post("/:loanId/approve", requireRole("loan_officer", "admin"), loansController.approveLoan);
route.post("/:loanId/disburse", requireRole("loan_officer", "admin"), loansController.disburseLoan);

module.exports = route;
