const User = require("../models/users");
const RefreshToken = require("../models/refreshTokens");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Op } = require("sequelize");

/**
 * Generate access token (short-lived: 15 minutes)
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user.userId,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRY || "15m",
    }
  );
};

/**
 * Generate refresh token (long-lived: 7 days)
 */
const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString("hex");
};

/**
 * Register a new user
 */
exports.register = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      otherNames,
      email,
      phoneNumber,
      password,
      dateOfBirth,
      ghanaCardNo,
    } = req.body;

    // Basic validation
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phoneNumber ||
      !dateOfBirth ||
      !ghanaCardNo ||
      !password
    ) {
      return res.status(400).json({
        message: "Error: Incomplete Credential Fields",
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({
      where: {
        [Op.or]: [{ email }, { phoneNumber }],
      },
    });

    if (userExists) {
      return res.status(400).json({
        message: "User with email or phone number already exists",
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      otherNames,
      email,
      phoneNumber,
      password,
      dateOfBirth,
      ghanaCardNo,
    });

    res.status(201).json({
      message: "User successfully registered",
      user: {
        userId: user.userId,
        name: `${user.lastName} ${user.firstName} ${user.otherNames || ""}`.trim(),
        email: user.email,
        phoneNumber: user.phoneNumber,
        dateOfBirth: user.dateOfBirth,
        ghanaCardNo: user.ghanaCardNo,
        role: user.role,
        isActive: user.isActive,
        kycStatus: user.kycStatus,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Login user and generate tokens
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        message: "Invalid Credentials",
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        message: "Account is inactive. Please contact support.",
      });
    }

    // Validate password
    const isMatch = await user.validatePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid Credentials",
      });
    }

    // Update last login
    await user.update({
      lastLogin: new Date(),
    });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshTokenValue = generateRefreshToken();

    // Calculate expiry (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Store refresh token in database
    await RefreshToken.create({
      userId: user.userId,
      token: refreshTokenValue,
      expiresAt,
      isRevoked: false,
    });

    res.status(200).json({
      message: "User successfully logged in",
      user: {
        userId: user.userId,
        name: `${user.lastName} ${user.firstName} ${user.otherNames || ""}`.trim(),
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
      },
      tokens: {
        accessToken,
        refreshToken: refreshTokenValue,
        expiresIn: process.env.JWT_ACCESS_EXPIRY || "15m",
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Refresh access token using refresh token
 */
exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        message: "Refresh token is required",
      });
    }

    // Find refresh token in database
    const tokenRecord = await RefreshToken.findOne({
      where: {
        token: refreshToken,
        isRevoked: false,
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: { exclude: ["password"] },
        },
      ],
    });

    if (!tokenRecord) {
      return res.status(401).json({
        message: "Invalid or revoked refresh token",
      });
    }

    // Check if token has expired
    if (new Date() > tokenRecord.expiresAt) {
      // Mark as revoked
      await tokenRecord.update({ isRevoked: true });
      return res.status(401).json({
        message: "Refresh token has expired",
      });
    }

    const user = tokenRecord.user;

    if (!user.isActive) {
      return res.status(403).json({
        message: "Account is inactive",
      });
    }

    // Generate new access token
    const accessToken = generateAccessToken(user);

    res.status(200).json({
      message: "Token refreshed successfully",
      tokens: {
        accessToken,
        expiresIn: process.env.JWT_ACCESS_EXPIRY || "15m",
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Logout user and revoke refresh token
 */
exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        message: "Refresh token is required",
      });
    }

    // Find and revoke refresh token
    const tokenRecord = await RefreshToken.findOne({
      where: {
        token: refreshToken,
        isRevoked: false,
      },
    });

    if (tokenRecord) {
      await tokenRecord.update({ isRevoked: true });
    }

    res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get current user profile
 */
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      user: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        otherNames: user.otherNames,
        email: user.email,
        phoneNumber: user.phoneNumber,
        dateOfBirth: user.dateOfBirth,
        ghanaCardNo: user.ghanaCardNo,
        role: user.role,
        isActive: user.isActive,
        kycStatus: user.kycStatus,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    return next(error);
  }
};
