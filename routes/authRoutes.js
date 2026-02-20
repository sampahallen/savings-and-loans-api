const express = require("express");
const route = express.Router();
const UserController = require("../controllers/authController");
const { authenticate } = require("../middlewares/auth");

route.post("/register", UserController.register);
route.post("/login", UserController.login);
route.post("/refresh", UserController.refresh);
route.post("/logout", UserController.logout);
route.get("/profile", authenticate, UserController.getProfile);

module.exports = route;