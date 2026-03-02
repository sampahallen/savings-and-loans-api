const express = require("express");
const route = express.Router();
const UserController = require("../controllers/authController");
const { authenticate } = require("../middlewares/auth");
const { uploadGhanaCard } = require("../middlewares/upload");

// Optional Ghana card image upload on register
route.post(
  "/register",
  uploadGhanaCard.single("ghanaCardImage"),
  UserController.register
);
route.post("/login", UserController.login);
route.post("/refresh", UserController.refresh);
route.post("/logout", UserController.logout);
route.get("/profile", authenticate, UserController.getProfile);

module.exports = route;