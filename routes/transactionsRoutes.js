const express = require("express");
const route = express.Router();
const transactionsController = require("../controllers/transactionsController");
const { authenticate } = require("../middlewares/auth");

// All routes require authentication
route.use(authenticate);

route.get("/", transactionsController.getTransactions);
route.get("/:transactionId", transactionsController.getTransaction);

module.exports = route;
