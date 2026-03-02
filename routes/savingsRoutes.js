const express = require("express");
const route = express.Router();
const savingsController = require("../controllers/savingsController");
const { authenticate } = require("../middlewares/auth");

// All routes require authentication
route.use(authenticate);

route.post("/accounts", savingsController.createAccount);
route.get("/accounts", savingsController.getMyAccounts);
route.get("/accounts/:accountId", savingsController.getAccount);
route.post("/accounts/:accountId/deposit", savingsController.deposit);
route.post("/accounts/:accountId/withdraw", savingsController.withdraw);

module.exports = route;
