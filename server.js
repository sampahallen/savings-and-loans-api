require("dotenv").config();
const express = require("express");
const sequelize = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Savings & Loans API is running",
    timestamp: new Date().toISOString(),
  });
});

// Routes
const authRoutes = require("./routes/authRoutes");
const savingsRoutes = require("./routes/savingsRoutes");
const loansRoutes = require("./routes/loansRoutes");
const transactionsRoutes = require("./routes/transactionsRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/savings", savingsRoutes);
app.use("/api/loans", loansRoutes);
app.use("/api/transactions", transactionsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 4000;

// Test database connection
sequelize
  .authenticate()
  .then(() => {
    console.log("Database connection established successfully");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
    process.exit(1);
  });