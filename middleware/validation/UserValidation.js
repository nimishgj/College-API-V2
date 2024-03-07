const User = require("../../models/User.model");
const { check, validationResult } = require("express-validator");

exports.validateUser = [
  check("email", "Please enter a valid email").isEmail(),
  check("password", "Please enter a valid password").isLength({
    min: 6,
  }),
  check("role", "Please enter a valid role").isIn(["admin", "user"]),
];

exports.validateUserLogin = [
  check("email", "Please enter a valid email").isEmail(),
  check("password", "Please enter a valid password").isLength({
    min: 6,
  }),
];

exports.validateUserChangePasswordRequest = [
  check("email", "Please enter a valid email").isEmail(),
];

exports.validateUserChangePassword = [
  check("password", "Please enter a valid password").isLength({
    min: 6,
  }),
  check("newPassword", "Please enter a valid password").isLength({
    min: 6,
  }),
];

exports.validateUserForgotPasswordRequest = [
  check("email", "Please enter a valid email").isEmail(),
];

exports.validateUserForgotPassword = [
  check("password", "Please enter a valid password").isLength({
    min: 6,
  }),
];
