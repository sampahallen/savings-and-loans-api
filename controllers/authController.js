const User = require("../models/users");
const jwt = require('jsonwebtoken')

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

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phoneNumber ||
      !dateOfBirth ||
      !ghanaCardNo
    ) {
      return res
        .status(400)
        .json({ message: "Error: Incomplete Credential Fields" });
    }
    const userExists = await User.findOne({
      where: { email: email, phoneNumber: phoneNumber },
    });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "User with email or phone number already exists" });
    }
    const user = await User.create(req.body);
    res.status(201).json({
      message: "User successfully registered",
      user: {
        name: user.lastName + user.firstName + user.otherNames,
        email: user.email,
        phoneNumber: user.phoneNumber,
        dateOfBirth: user.dateOfBirth,
        ghanacard: user.ghanaCardNo,
        role: user.role,
        isActive: user.isActive,
        kycStatus: user.kycStatus,
      },
    });
  } catch (error) {
    return next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }
    const isMatch = await user.validatePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }
    await user.update({
        lastLogin: new Date(),
    })
    res.status(200).json({
      message: "User successfuly login",
      user: {
        name: user.lastName + user.firstName + user.otherNames,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    return next(error);
  }
};
