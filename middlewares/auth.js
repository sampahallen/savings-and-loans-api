const jwt = require("jsonwebtoken");
const User = require("../models/users");
const RefreshToken = require("../models/refreshTokens");

/**
 * Middleware to verify JWT access token
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required. Please provide a valid token.",
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    if (!token) {
      return res.status(401).json({
        message: "Authentication required. Please provide a valid token.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from database
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid token. User not found.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Account is inactive. Please contact support.",
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid token.",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token has expired. Please refresh your token.",
      });
    }
    return res.status(500).json({
      message: "Authentication error.",
      error: error.message,
    });
  }
};

/**
 * Middleware to check if user has required role(s)
 * Usage: authorize(['admin', 'loan_officer'])
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied. Insufficient permissions.",
      });
    }

    next();
  };
};

/**
 * Combined middleware: authenticate + authorize
 * Usage: requireRole(['admin', 'loan_officer'])
 */
const requireRole = (...allowedRoles) => {
  return [authenticate, authorize(...allowedRoles)];
};

module.exports = {
  authenticate,
  authorize,
  requireRole,
};
